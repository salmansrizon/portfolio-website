import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// ── Shared types ──────────────────────────────────────────────
export interface SessionType {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    fee: number;
    is_active: boolean;
}

export interface PaymentSettings {
    id: string;
    bkash_number: string | null;
    nagad_number: string | null;
    payment_window_minutes: number;
    additional_instructions: string | null;
}

export interface UnavailableSlot {
    id: string;
    date: string;
    time_slot: string | null;
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
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
        available_weekdays: DEFAULT_WEEKDAYS,
        time_slots: DEFAULT_TIME_SLOTS
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [sessRes, payRes, slotsRes, settingsRes] = await Promise.all([
                supabase.from('session_types').select('*').eq('is_active', true),
                supabase.from('payment_settings').select('*').limit(1).single(),
                supabase.from('unavailable_slots').select('*'),
                supabase.from('availability_settings').select('*').limit(1).single()
            ]);
            if (sessRes.data) setSessionTypes(sessRes.data as SessionType[]);
            if (payRes.data) setPaymentSettings(payRes.data as PaymentSettings);
            if (slotsRes.data) setUnavailableSlots(slotsRes.data as UnavailableSlot[]);

            // Availability settings
            if (settingsRes.data) {
                setAvailabilitySettings(settingsRes.data as AvailabilitySettings);
            }

            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Helpers ────────────────────────────────────────────────────
    const isDateUnavailable = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        return unavailableSlots.some(slot => slot.date === dateString && slot.time_slot === null);
    };

    const getAvailableTimeSlots = (date: Date | undefined) => {
        if (!date) return availabilitySettings.time_slots;
        const dateString = format(date, 'yyyy-MM-dd');
        return availabilitySettings.time_slots.filter(
            t => !unavailableSlots.some(s => s.date === dateString && s.time_slot === t),
        );
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
        submitQuickBooking,
    };
}
