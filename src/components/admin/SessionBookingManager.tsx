import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Trash2, Edit, CheckCircle, XCircle, Clock, Save,
  CalendarIcon, CalendarX
} from "lucide-react";
import { format } from "date-fns";

// ── Types ────────────────────────────────────────────────────
interface SessionType {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  fee: number;
  is_active: boolean;
  is_paid: boolean;
}

interface SessionBooking {
  id: string;
  user_name: string;
  user_email: string;
  whatsapp_number: string | null;
  phone_number: string | null;
  booking_date: string;
  time_slot: string;
  payment_method: string;
  transaction_id: string | null;
  payment_status: string;
  booking_status: string;
  fee_amount: number;
  created_at: string;
  session_type_id: string;
}

interface PaymentSettings {
  id: string;
  bkash_number: string | null;
  nagad_number: string | null;
  payment_window_minutes: number;
  additional_instructions: string | null;
  bkash_qr_code?: string | null;
  nagad_qr_code?: string | null;
}

interface AvailabilitySettings {
  id: string;
  available_weekdays: number[];
  time_slots: string[];
}

interface UnavailableSlot {
  id: string;
  date: string;
  time_slot?: string;
  reason?: string;
  created_at: string;
}

const PAYMENT_STATUSES = ['pending', 'submitted', 'verified', 'rejected'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

const SessionBookingManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bookings');

  // ── Data state ─────────────────────────────────────────────
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null);

  // ── Edit state ─────────────────────────────────────────────
  const [editingBooking, setEditingBooking] = useState<SessionBooking | null>(null);
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [newType, setNewType] = useState({ title: '', description: '', duration_minutes: 60, fee: 0, is_paid: true });
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);

  // ── Unavailable slot form ──────────────────────────────────
  const [slotForm, setSlotForm] = useState({
    date: undefined as Date | undefined,
    time_slot: '',
    reason: '',
    isFullDay: false
  });

  // ── Fetch everything ───────────────────────────────────────
  const fetchAll = async () => {
    const [stRes, bkRes, psRes, usRes, asRes] = await Promise.all([
      supabase.from('session_types').select('*'),
      supabase.from('session_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('payment_settings').select('*').limit(1).single(),
      supabase.from('unavailable_slots').select('*').order('date', { ascending: true }),
      supabase.from('availability_settings').select('*').limit(1).single(),
    ]);
    if (stRes.data) setSessionTypes(stRes.data as SessionType[]);
    if (bkRes.data) setBookings(bkRes.data as SessionBooking[]);
    if (psRes.data) setPaymentSettings(psRes.data as PaymentSettings);
    if (usRes.data) setUnavailableSlots(usRes.data as UnavailableSlot[]);
    if (asRes.data) setAvailabilitySettings(asRes.data as AvailabilitySettings);
  };

  useEffect(() => { fetchAll(); }, []);

  // ═══════════════════════════════════════════════════════════
  // Session Types CRUD
  // ═══════════════════════════════════════════════════════════
  const handleAddSessionType = async () => {
    if (!newType.title) return;
    const { error } = await supabase.from('session_types').insert(newType);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Session type added" });
    setNewType({ title: '', description: '', duration_minutes: 60, fee: 0, is_paid: true });
    setShowNewTypeForm(false);
    fetchAll();
  };

  const handleUpdateSessionType = async (st: SessionType) => {
    const { error } = await supabase.from('session_types').update({
      title: st.title, description: st.description, duration_minutes: st.duration_minutes, fee: st.fee, is_active: st.is_active, is_paid: st.is_paid
    }).eq('id', st.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Session type updated" });
    setEditingType(null);
    fetchAll();
  };

  const handleDeleteSessionType = async (id: string) => {
    const { error } = await supabase.from('session_types').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Session type deleted" });
    fetchAll();
  };

  // ═══════════════════════════════════════════════════════════
  // Bookings CRUD
  // ═══════════════════════════════════════════════════════════
  const handleQuickStatusUpdate = async (id: string, booking_status: string, payment_status: string) => {
    const { error } = await supabase.from('session_bookings').update({ booking_status, payment_status }).eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking updated" });
    fetchAll();
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;
    const { error } = await supabase.from('session_bookings').update({
      user_name: editingBooking.user_name,
      user_email: editingBooking.user_email,
      whatsapp_number: editingBooking.whatsapp_number,
      phone_number: editingBooking.phone_number,
      booking_date: editingBooking.booking_date,
      time_slot: editingBooking.time_slot,
      payment_method: editingBooking.payment_method,
      transaction_id: editingBooking.transaction_id,
      payment_status: editingBooking.payment_status,
      booking_status: editingBooking.booking_status,
      fee_amount: editingBooking.fee_amount,
      session_type_id: editingBooking.session_type_id,
    }).eq('id', editingBooking.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking saved" });
    setEditingBooking(null);
    fetchAll();
  };

  const handleDeleteBooking = async (id: string) => {
    const { error } = await supabase.from('session_bookings').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking deleted" });
    setEditingBooking(null);
    fetchAll();
  };

  // ═══════════════════════════════════════════════════════════
  // Payment Settings
  // ═══════════════════════════════════════════════════════════
  const handleUpdatePaymentSettings = async () => {
    if (!paymentSettings) return;
    const { error } = await supabase.from('payment_settings').update({
      bkash_number: paymentSettings.bkash_number,
      nagad_number: paymentSettings.nagad_number,
      bkash_qr_code: paymentSettings.bkash_qr_code,
      nagad_qr_code: paymentSettings.nagad_qr_code,
      payment_window_minutes: paymentSettings.payment_window_minutes,
      additional_instructions: paymentSettings.additional_instructions,
    }).eq('id', paymentSettings.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Payment settings updated" });
  };

  const handleUpdateAvailability = async () => {
    if (!availabilitySettings) return;
    const { error } = await supabase.from('availability_settings').update({
      available_weekdays: availabilitySettings.available_weekdays,
      time_slots: availabilitySettings.time_slots,
    }).eq('id', availabilitySettings.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Availability settings updated" });
  };

  // ═══════════════════════════════════════════════════════════
  // Unavailable Slots CRUD
  // ═══════════════════════════════════════════════════════════
  const handleAddSlot = async () => {
    if (!slotForm.date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }
    if (!slotForm.isFullDay && !slotForm.time_slot) {
      toast({ title: "Error", description: "Please select a time slot or mark as full day", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('unavailable_slots').insert({
      date: format(slotForm.date, 'yyyy-MM-dd'),
      time_slot: slotForm.isFullDay ? null : slotForm.time_slot,
      reason: slotForm.reason || null
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Unavailable slot added" });
    setSlotForm({ date: undefined, time_slot: '', reason: '', isFullDay: false });
    fetchAll();
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase.from('unavailable_slots').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Unavailable slot removed" });
    fetchAll();
  };

  // ── Helpers ────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning-soft text-warning dark:bg-warning dark:text-warning-soft',
      submitted: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
      verified: 'bg-success-soft text-success dark:bg-success dark:text-success-soft',
      confirmed: 'bg-success-soft text-success dark:bg-success dark:text-success-soft',
      rejected: 'bg-danger-soft text-danger dark:bg-danger dark:text-danger-soft',
      cancelled: 'bg-danger-soft text-danger dark:bg-danger dark:text-danger-soft',
      completed: 'bg-primary/10 text-primary',
    };
    return <Badge className={colors[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>;
  };

  const getSessionTitle = (id: string) => sessionTypes.find(s => s.id === id)?.title || '—';

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 relative z-10">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="session-types">Session Types</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="unavailable-slots">Unavailable Slots</TabsTrigger>
          <TabsTrigger value="payment-settings">Payment Settings</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════
            TAB 1 — Bookings
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>TXN ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.user_name}</TableCell>
                    <TableCell>{b.user_email}</TableCell>
                    <TableCell className="text-xs">{getSessionTitle(b.session_type_id)}</TableCell>
                    <TableCell>{b.booking_date}</TableCell>
                    <TableCell>{b.time_slot}</TableCell>
                    <TableCell>{statusBadge(b.payment_status)} <span className="text-xs ml-1">{b.payment_method}</span></TableCell>
                    <TableCell className="font-mono text-xs">{b.transaction_id || '-'}</TableCell>
                    <TableCell>{statusBadge(b.booking_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Edit" onClick={() => setEditingBooking({ ...b })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Confirm" onClick={() => handleQuickStatusUpdate(b.id, 'confirmed', 'verified')}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Reject" onClick={() => handleQuickStatusUpdate(b.id, 'cancelled', 'rejected')}>
                          <XCircle className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 2 — Session Types
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="session-types" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNewTypeForm(!showNewTypeForm)}>
              <Plus className="h-4 w-4 mr-2" /> Add Session Type
            </Button>
          </div>

          {showNewTypeForm && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={newType.title} onChange={e => setNewType(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fee (৳)</Label>
                    <Input type="number" value={newType.fee} onChange={e => setNewType(p => ({ ...p, fee: Number(e.target.value) }))} disabled={!newType.is_paid} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={newType.description} onChange={e => setNewType(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={newType.duration_minutes} onChange={e => setNewType(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="new-type-is-paid"
                      checked={newType.is_paid}
                      onCheckedChange={checked => setNewType(p => ({ ...p, is_paid: checked }))}
                    />
                    <Label htmlFor="new-type-is-paid" className="cursor-pointer">
                      {newType.is_paid ? (
                        <span className="text-primary font-medium">Paid Session</span>
                      ) : (
                        <span className="text-success dark:text-success font-medium">Free Session</span>
                      )}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {newType.is_paid ? 'Customer will be asked to pay before confirming.' : 'No payment required — booking confirms immediately.'}
                  </span>
                </div>
                <Button onClick={handleAddSessionType}>Save</Button>
              </CardContent>
            </Card>
          )}

          {sessionTypes.map(st => (
            <Card key={st.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{st.title}</h4>
                    {st.is_paid ? (
                      <Badge className="bg-primary/10 text-primary text-xs">Paid — ৳{st.fee}</Badge>
                    ) : (
                      <Badge className="bg-success-soft text-success dark:bg-success dark:text-success text-xs">Free</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{st.description}</p>
                  <p className="text-sm text-muted-foreground">{st.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Active</Label>
                    <Switch checked={st.is_active} onCheckedChange={checked => handleUpdateSessionType({ ...st, is_active: checked })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">{st.is_paid ? 'Paid' : 'Free'}</Label>
                    <Switch checked={st.is_paid} onCheckedChange={checked => handleUpdateSessionType({ ...st, is_paid: checked })} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditingType({ ...st })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSessionType(st.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 3 — Unavailable Slots
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="unavailable-slots" className="space-y-6">
          {/* Add new slot form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <CalendarX className="mr-2 h-5 w-5" />
                Add Unavailable Slot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {slotForm.date ? format(slotForm.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={slotForm.date}
                        onSelect={date => setSlotForm(p => ({ ...p, date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={slotForm.isFullDay ? 'full-day' : 'time-slot'}
                    onValueChange={v => setSlotForm(p => ({ ...p, isFullDay: v === 'full-day', time_slot: v === 'full-day' ? '' : p.time_slot }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time-slot">Specific Time Slot</SelectItem>
                      <SelectItem value="full-day">Full Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!slotForm.isFullDay && (
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <Select value={slotForm.time_slot} onValueChange={v => setSlotForm(p => ({ ...p, time_slot: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t} (GMT+6)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="Meeting, holiday, personal time, etc."
                  value={slotForm.reason}
                  onChange={e => setSlotForm(p => ({ ...p, reason: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleAddSlot} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Unavailable Slot
              </Button>
            </CardContent>
          </Card>

          {/* Existing unavailable slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Clock className="mr-2 h-5 w-5" />
                Current Unavailable Slots ({unavailableSlots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unavailableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarX className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No unavailable slots configured</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unavailableSlots.map(slot => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-medium">{format(new Date(slot.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            {slot.time_slot ? (
                              <Badge variant="outline">{slot.time_slot}</Badge>
                            ) : (
                              <Badge variant="secondary">Full Day</Badge>
                            )}
                          </TableCell>
                          <TableCell>{slot.reason || <span className="text-muted-foreground">No reason</span>}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Unavailable Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? This will make the time slot available for booking again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 3 — Availability
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="availability" className="space-y-4">
          {availabilitySettings && (
            <Card>
              <CardHeader>
                <CardTitle>Global Availability Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Available Days of the Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, ix) => {
                      const isActive = availabilitySettings.available_weekdays.includes(ix);
                      return (
                        <Button
                          key={day}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          className="w-16"
                          onClick={() => {
                            setAvailabilitySettings(p => {
                              if (!p) return p;
                              const days = p.available_weekdays.includes(ix)
                                ? p.available_weekdays.filter(d => d !== ix)
                                : [...p.available_weekdays, ix].sort();
                              return { ...p, available_weekdays: days };
                            });
                          }}
                        >
                          {day}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Available Time Slots</Label>
                  <div className="text-sm text-muted-foreground mb-2">Configure the standard time slots offered on available days.</div>
                  <div className="flex flex-wrap gap-2 max-w-2xl">
                    {TIME_SLOTS.map(t => {
                      const isActive = availabilitySettings.time_slots.includes(t);
                      return (
                        <Button
                          key={t}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className="w-16"
                          onClick={() => {
                            setAvailabilitySettings(p => {
                              if (!p) return p;
                              const slots = p.time_slots.includes(t)
                                ? p.time_slots.filter(s => s !== t)
                                : [...p.time_slots, t].sort();
                              return { ...p, time_slots: slots };
                            });
                          }}
                        >
                          {t}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleUpdateAvailability} className="mt-4">
                  <Save className="mr-2 h-4 w-4" /> Save Availability Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 4 — Payment Settings
            ═══════════════════════════════════════════════════════ */}
        <TabsContent value="payment-settings" className="space-y-4">
          {paymentSettings && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>bKash Number</Label>
                    <Input value={paymentSettings.bkash_number || ''} onChange={e => setPaymentSettings(p => p ? { ...p, bkash_number: e.target.value } : p)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nagad Number</Label>
                    <Input value={paymentSettings.nagad_number || ''} onChange={e => setPaymentSettings(p => p ? { ...p, nagad_number: e.target.value } : p)} />
                  </div>
                  <div className="space-y-2">
                    <Label>bKash QR Code (Image URL)</Label>
                    <Input placeholder="https://..." value={paymentSettings.bkash_qr_code || ''} onChange={e => setPaymentSettings(p => p ? { ...p, bkash_qr_code: e.target.value } : p)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nagad QR Code (Image URL)</Label>
                    <Input placeholder="https://..." value={paymentSettings.nagad_qr_code || ''} onChange={e => setPaymentSettings(p => p ? { ...p, nagad_qr_code: e.target.value } : p)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Window (minutes)</Label>
                  <Input type="number" value={paymentSettings.payment_window_minutes} onChange={e => setPaymentSettings(p => p ? { ...p, payment_window_minutes: Number(e.target.value) } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Additional Instructions</Label>
                  <Textarea value={paymentSettings.additional_instructions || ''} onChange={e => setPaymentSettings(p => p ? { ...p, additional_instructions: e.target.value } : p)} />
                </div>
                <Button onClick={handleUpdatePaymentSettings}>
                  <Save className="h-4 w-4 mr-2" /> Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════
          Edit Booking Dialog
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={!!editingBooking} onOpenChange={open => !open && setEditingBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Booking</DialogTitle></DialogHeader>
          {editingBooking && (
            <div className="space-y-5 py-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editingBooking.user_name} onChange={e => setEditingBooking(p => p ? { ...p, user_name: e.target.value } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editingBooking.user_email} onChange={e => setEditingBooking(p => p ? { ...p, user_email: e.target.value } : p)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={editingBooking.whatsapp_number || ''} onChange={e => setEditingBooking(p => p ? { ...p, whatsapp_number: e.target.value } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editingBooking.phone_number || ''} onChange={e => setEditingBooking(p => p ? { ...p, phone_number: e.target.value } : p)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <Select value={editingBooking.session_type_id} onValueChange={v => setEditingBooking(p => p ? { ...p, session_type_id: v } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map(st => <SelectItem key={st.id} value={st.id}>{st.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={editingBooking.booking_date} onChange={e => setEditingBooking(p => p ? { ...p, booking_date: e.target.value } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <Input value={editingBooking.time_slot} onChange={e => setEditingBooking(p => p ? { ...p, time_slot: e.target.value } : p)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={editingBooking.payment_method} onValueChange={v => setEditingBooking(p => p ? { ...p, payment_method: v } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fee (৳)</Label>
                  <Input type="number" value={editingBooking.fee_amount} onChange={e => setEditingBooking(p => p ? { ...p, fee_amount: Number(e.target.value) } : p)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Input value={editingBooking.transaction_id || ''} onChange={e => setEditingBooking(p => p ? { ...p, transaction_id: e.target.value } : p)} className="font-mono" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={editingBooking.payment_status} onValueChange={v => setEditingBooking(p => p ? { ...p, payment_status: v } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Booking Status</Label>
                  <Select value={editingBooking.booking_status} onValueChange={v => setEditingBooking(p => p ? { ...p, booking_status: v } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOOKING_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between gap-2 pt-2">
                <Button variant="destructive" size="sm" onClick={() => handleDeleteBooking(editingBooking.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleSaveBooking}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          Edit Session Type Dialog
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={!!editingType} onOpenChange={open => !open && setEditingType(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Session Type</DialogTitle></DialogHeader>
          {editingType && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editingType.title} onChange={e => setEditingType(p => p ? { ...p, title: e.target.value } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editingType.description || ''} onChange={e => setEditingType(p => p ? { ...p, description: e.target.value } : p)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={editingType.duration_minutes} onChange={e => setEditingType(p => p ? { ...p, duration_minutes: Number(e.target.value) } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Fee (৳)</Label>
                  <Input type="number" value={editingType.fee} onChange={e => setEditingType(p => p ? { ...p, fee: Number(e.target.value) } : p)} disabled={!editingType.is_paid} />
                </div>
              </div>
              {/* Session pricing type */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Switch
                  id="edit-type-is-paid"
                  checked={editingType.is_paid}
                  onCheckedChange={checked => setEditingType(p => p ? { ...p, is_paid: checked } : p)}
                />
                <div>
                  <Label htmlFor="edit-type-is-paid" className="cursor-pointer font-medium">
                    {editingType.is_paid ? (
                      <span className="text-primary">Paid Session</span>
                    ) : (
                      <span className="text-success dark:text-success">Free Session</span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editingType.is_paid
                      ? 'Customer must complete payment (bKash/Nagad) to confirm.'
                      : 'No payment required — booking is confirmed without payment.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingType.is_active} onCheckedChange={checked => setEditingType(p => p ? { ...p, is_active: checked } : p)} />
                <Label>Active</Label>
              </div>
              <DialogFooter className="pt-2">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => handleUpdateSessionType(editingType)}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionBookingManager;
