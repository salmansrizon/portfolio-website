import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { createRepository } from '@/integrations/supabase/repository';
import { sessionTypeConfig, paymentSettingsConfig, unavailableSlotConfig, availabilitySettingsConfig } from '@/adapters/entityConfigs';

// Create repository instances for each table
const sessionTypeRepository = createRepository(sessionTypeConfig);
const paymentSettingsRepository = createRepository(paymentSettingsConfig);
const unavailableSlotRepository = createRepository(unavailableSlotConfig);
const availabilitySettingsRepository = createRepository(availabilitySettingsConfig);

// ── Shared types ──────────────────────────────────────────────
export interface SessionType {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    fee: number;
    is_active: boolean;
    is_paid: boolean;
}

export interface PaymentSettings {
    id: string;
    bkash_number: string | null;
    nagad_number: string | null;
    bkash_qr_code?: string | null;
    nagad_qr_code?: string | null;
    payment_window_minutes: number;
    additional_instructions: string | null;
}

export interface UnavailableSlot {
    id: string;
    date: string;
    time_slot: string | null;
}

// A lightweight view of existing bookings used to block already-taken slots
export interface BookedSlot {
    booking_date: string;
    time_slot: string;
    booking_status: string;
    payment_status: string;
}

// ── Constants & Fallbacks ─────────────────────────────────────
export const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri
export const DEFAULT_TIME_SLOTS = [

    "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
    "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

export interface AvailabilitySettings {
    id?: string;
    available_weekdays: number[];
    time_slots: string[];
}


// ── Quick-book payload (Contact form, no payment step) ────────
export interface QuickBookingPayload {
    sessionTypeId: string;
    name: string;
    email: string;
    date: Date;
    time: string;
    message?: string;
}

// ── Hook ──────────────────────────────────────────────────────
export function useBookingData() {
    // Use repository hooks for data fetching
    const { data: sessionTypes = [], isLoading: isSessionTypesLoading } = sessionTypeRepository.useFindByFilter({ is_active: true });
    const { data: paymentSettingsData = [], isLoading: isPaymentSettingsLoading } = paymentSettingsRepository.useFindAll();
    const { data: unavailableSlots = [], isLoading: isUnavailableSlotsLoading } = unavailableSlotRepository.useFindAll();
    const { data: availabilitySettingsData = [], isLoading: isAvailabilitySettingsLoading } = availabilitySettingsRepository.useFindAll();

    // For single-row tables, take the first result
    const paymentSettings = paymentSettingsData[0] || null;
    const availabilitySettings = availabilitySettingsData[0] || {
        available_weekdays: DEFAULT_WEEKDAYS,
        time_slots: DEFAULT_TIME_SLOTS
    };

    // Fetch booked slots separately (different table structure)
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);

    useEffect(() => {
        const fetchBookedSlots = async () => {
            const { data, error } = await supabase
                .from('session_bookings')
                .select('booking_date, time_slot, booking_status, payment_status')
                .in('booking_status', ['pending', 'confirmed'])
                .neq('payment_status', 'rejected');
            
            if (!error && data) {
                setBookedSlots(data as BookedSlot[]);
            }
            setIsBookingsLoading(false);
        };

        fetchBookedSlots();
    }, []);

    // Combined loading state
    const isLoading = isSessionTypesLoading || isPaymentSettingsLoading || isUnavailableSlotsLoading || isAvailabilitySettingsLoading || isBookingsLoading;

    // Helpers ────────────────────────────────────────────────────

    /** Returns true if a specific date+time is already taken by an active booking */
    const isSlotBooked = (dateString: string, timeSlot: string) =>
        bookedSlots.some(b => b.booking_date === dateString && b.time_slot === timeSlot);

    const isDateUnavailable = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        // Admin-blocked full day
        if (unavailableSlots.some(slot => slot.date === dateString && slot.time_slot === null)) return true;
        // All available slots on this day are already booked
        const daySlots = availabilitySettings.time_slots.filter(
            t => !unavailableSlots.some(s => s.date === dateString && s.time_slot === t)
        );
        return daySlots.length > 0 && daySlots.every(t => isSlotBooked(dateString, t));
    };

    const getAvailableTimeSlots = (date: Date | undefined) => {
        if (!date) return availabilitySettings.time_slots;
        const dateString = format(date, 'yyyy-MM-dd');
        return availabilitySettings.time_slots.filter(t => {
            // Remove admin-blocked slots
            if (unavailableSlots.some(s => s.date === dateString && s.time_slot === t)) return false;
            // Remove already-booked slots
            if (isSlotBooked(dateString, t)) return false;
            return true;
        });
    };

    const getAllTimeSlotsWithAvailability = (date: Date | undefined) => {
        if (!date) return availabilitySettings.time_slots.map(t => ({ time: t, available: true }));
        const dateString = format(date, 'yyyy-MM-dd');
        return availabilitySettings.time_slots.map(t => {
            const isBlocked = unavailableSlots.some(s => s.date === dateString && s.time_slot === t);
            const isBooked = isSlotBooked(dateString, t);
            return {
                time: t,
                available: !isBlocked && !isBooked
            };
        });
    };

    // Quick-book submission (used by Contact component) ─────────
    const submitQuickBooking = async (payload: QuickBookingPayload) => {
        const session = sessionTypes.find(s => s.id === payload.sessionTypeId);
        if (!session) throw new Error('Invalid session type');

        const { data, error } = await supabase.from('session_bookings').insert({
            session_type_id: payload.sessionTypeId,
            user_name: payload.name,
            user_email: payload.email,
            booking_date: format(payload.date, 'yyyy-MM-dd'),
            time_slot: payload.time,
            payment_method: 'pending',
            fee_amount: session.fee,
            payment_status: 'pending',
            booking_status: 'pending',
        }).select().single();

        if (error) throw error;
        return data;
    };

    return {
        sessionTypes,
        paymentSettings,
        unavailableSlots,
        availabilitySettings,
        isLoading,
        isDateUnavailable,
        getAvailableTimeSlots,
        getAllTimeSlotsWithAvailability,
        submitQuickBooking,
    };
}
