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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface SessionType {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  fee: number;
  is_active: boolean;
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
}

const SessionBookingManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bookings');
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [editingType, setEditingType] = useState<SessionType | null>(null);
  const [newType, setNewType] = useState({ title: '', description: '', duration_minutes: 60, fee: 0 });
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);

  const fetchAll = async () => {
    const [stRes, bkRes, psRes] = await Promise.all([
      supabase.from('session_types').select('*'),
      supabase.from('session_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('payment_settings').select('*').limit(1).single(),
    ]);
    if (stRes.data) setSessionTypes(stRes.data as SessionType[]);
    if (bkRes.data) setBookings(bkRes.data as SessionBooking[]);
    if (psRes.data) setPaymentSettings(psRes.data as PaymentSettings);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddSessionType = async () => {
    if (!newType.title) return;
    const { error } = await supabase.from('session_types').insert(newType);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Session type added" });
    setNewType({ title: '', description: '', duration_minutes: 60, fee: 0 });
    setShowNewTypeForm(false);
    fetchAll();
  };

  const handleUpdateSessionType = async (st: SessionType) => {
    const { error } = await supabase.from('session_types').update({
      title: st.title, description: st.description, duration_minutes: st.duration_minutes, fee: st.fee, is_active: st.is_active
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

  const handleUpdateBookingStatus = async (id: string, booking_status: string, payment_status: string) => {
    const { error } = await supabase.from('session_bookings').update({ booking_status, payment_status }).eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking updated" });
    fetchAll();
  };

  const handleUpdatePaymentSettings = async () => {
    if (!paymentSettings) return;
    const { error } = await supabase.from('payment_settings').update({
      bkash_number: paymentSettings.bkash_number,
      nagad_number: paymentSettings.nagad_number,
      payment_window_minutes: paymentSettings.payment_window_minutes,
      additional_instructions: paymentSettings.additional_instructions,
    }).eq('id', paymentSettings.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Payment settings updated" });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      verified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-primary/10 text-primary',
    };
    return <Badge className={colors[status] || 'bg-muted text-muted-foreground'}>{status}</Badge>;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="session-types">Session Types</TabsTrigger>
        <TabsTrigger value="payment-settings">Payment Settings</TabsTrigger>
      </TabsList>

      {/* Bookings Tab */}
      <TabsContent value="bookings" className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
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
                  <TableCell>{b.booking_date}</TableCell>
                  <TableCell>{b.time_slot}</TableCell>
                  <TableCell>{statusBadge(b.payment_status)} <span className="text-xs ml-1">{b.payment_method}</span></TableCell>
                  <TableCell className="font-mono text-xs">{b.transaction_id || '-'}</TableCell>
                  <TableCell>{statusBadge(b.booking_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" title="Confirm" onClick={() => handleUpdateBookingStatus(b.id, 'confirmed', 'verified')}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" title="Reject" onClick={() => handleUpdateBookingStatus(b.id, 'cancelled', 'rejected')}>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Session Types Tab */}
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
                  <Input type="number" value={newType.fee} onChange={e => setNewType(p => ({ ...p, fee: Number(e.target.value) }))} />
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
              <Button onClick={handleAddSessionType}>Save</Button>
            </CardContent>
          </Card>
        )}

        {sessionTypes.map(st => (
          <Card key={st.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{st.title}</h4>
                <p className="text-sm text-muted-foreground">{st.duration_minutes} min — ৳{st.fee}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Active</Label>
                  <Switch checked={st.is_active} onCheckedChange={checked => handleUpdateSessionType({ ...st, is_active: checked })} />
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSessionType(st.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      {/* Payment Settings Tab */}
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
              </div>
              <div className="space-y-2">
                <Label>Payment Window (minutes)</Label>
                <Input type="number" value={paymentSettings.payment_window_minutes} onChange={e => setPaymentSettings(p => p ? { ...p, payment_window_minutes: Number(e.target.value) } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Additional Instructions</Label>
                <Textarea value={paymentSettings.additional_instructions || ''} onChange={e => setPaymentSettings(p => p ? { ...p, additional_instructions: e.target.value } : p)} />
              </div>
              <Button onClick={handleUpdatePaymentSettings}>Save Payment Settings</Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SessionBookingManager;
