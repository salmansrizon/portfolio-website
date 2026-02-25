import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Clock, Phone, Mail, User, CreditCard, CheckCircle2, Timer, ArrowRight, Smartphone, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingData } from "@/hooks/useBookingData";



type Step = 'details' | 'payment' | 'transaction' | 'confirmed';

// Steps visible to the user differ between free and paid sessions
const PAID_STEPS: Step[] = ['details', 'payment', 'transaction', 'confirmed'];
const FREE_STEPS: Step[] = ['details', 'confirmed'];

const BookSession = () => {
  const { toast } = useToast();
  const { sessionTypes, paymentSettings, unavailableSlots, isDateUnavailable, getAvailableTimeSlots, availabilitySettings } = useBookingData();
  const [step, setStep] = useState<Step>('details');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    phone: '',
    date: undefined as Date | undefined,
    time: '',
    paymentMethod: '' as 'bkash' | 'nagad' | '',
    transactionId: '',
  });

  // Countdown timer for payment window
  useEffect(() => {
    if (!paymentDeadline) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = paymentDeadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentDeadline]);

  const selectedSession = sessionTypes.find(s => s.id === selectedSessionType);
  const isFree = selectedSession ? !selectedSession.is_paid : false;

  const handleDetailsSubmit = async () => {
    const paymentMethodRequired = !isFree;
    if (!formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType || (paymentMethodRequired && !formData.paymentMethod)) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Free session: skip payment, insert directly as confirmed
    if (isFree) {
      if (!formData.date) return;
      try {
        const { data, error } = await supabase.from('session_bookings').insert({
          session_type_id: selectedSessionType,
          user_name: formData.name,
          user_email: formData.email,
          whatsapp_number: formData.whatsapp,
          phone_number: formData.phone,
          booking_date: format(formData.date, 'yyyy-MM-dd'),
          time_slot: formData.time,
          payment_method: 'free',
          fee_amount: 0,
          payment_status: 'not_required',
          booking_status: 'confirmed',
        }).select().single();
        if (error) throw error;
        if (data) setBookingId(data.id);
        setStep('confirmed');
        toast({ title: "Booking Confirmed!", description: "Your free session has been booked successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to create booking", variant: "destructive" });
      }
      return;
    }

    // Paid session: go to payment step
    setStep('payment');
  };

  const handlePaymentConfirm = async () => {
    if (!selectedSession || !formData.date) return;
    const windowMins = paymentSettings?.payment_window_minutes || 30;
    const deadline = addMinutes(new Date(), windowMins);
    setPaymentDeadline(deadline);

    try {
      const { data, error } = await supabase.from('session_bookings').insert({
        session_type_id: selectedSessionType,
        user_name: formData.name,
        user_email: formData.email,
        whatsapp_number: formData.whatsapp,
        phone_number: formData.phone,
        booking_date: format(formData.date, 'yyyy-MM-dd'),
        time_slot: formData.time,
        payment_method: formData.paymentMethod,
        fee_amount: selectedSession.fee,
        payment_status: 'pending',
        booking_status: 'pending',
        payment_deadline: deadline.toISOString(),
      }).select().single();

      if (error) throw error;
      if (data) setBookingId(data.id);
      setStep('transaction');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create booking", variant: "destructive" });
    }
  };

  const handleTransactionSubmit = async () => {
    if (!formData.transactionId.trim()) {
      toast({ title: "Error", description: "Please enter your transaction ID", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('session_bookings').update({
        transaction_id: formData.transactionId,
        payment_status: 'submitted',
      }).eq('id', bookingId);

      if (error) throw error;
      setStep('confirmed');
      toast({ title: "Booking Submitted!", description: "Your session booking has been submitted. We'll verify your payment and confirm shortly." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit transaction", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">Book a Private Session</h1>
            <p className="text-lg text-muted-foreground">Schedule your 1-on-1 consultation session</p>
          </div>
        </ScrollReveal>

        {/* Progress Steps */}
        <ScrollReveal direction="up" delay={0.1}>
          {(() => {
            const steps = isFree ? FREE_STEPS : PAID_STEPS;
            return (
              <div className="flex items-center justify-center gap-2 mb-10">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                      step === s || steps.indexOf(step) > i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {steps.indexOf(step) > i ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            );
          })()}
        </ScrollReveal>

        {/* Step 1: Details */}
        {step === 'details' && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Session Types */}
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Select Session</h3>
                {sessionTypes.map(st => (
                  <Card
                    key={st.id}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      selectedSessionType === st.id ? "border-primary shadow-hover" : "border-border hover:border-primary/40"
                    )}
                    onClick={() => {
                      setSelectedSessionType(st.id);
                      // Reset payment method when switching session type
                      setFormData(p => ({ ...p, paymentMethod: '' }));
                    }}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground">{st.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{st.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{st.duration_minutes} min</Badge>
                        {st.is_paid ? (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">৳{st.fee}</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200">
                            <Tag className="h-3 w-3 mr-1" />Free
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                  <CardDescription>Fill in your information and pick a slot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Your full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="01XXXXXXXXX" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="01XXXXXXXXX" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={date => setFormData(p => ({ ...p, date, time: '' }))}
                            disabled={date => date < new Date() || !availabilitySettings.available_weekdays.includes(date.getDay()) || isDateUnavailable(date)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Slot *</Label>
                      <Select value={formData.time} onValueChange={v => setFormData(p => ({ ...p, time: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                        <SelectContent>
                          {getAvailableTimeSlots(formData.date).map(t => (
                            <SelectItem key={t} value={t}>{t} (GMT+6)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Only show payment method selector for paid sessions */}
                  {selectedSession && !isFree && (
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['bkash', 'nagad'] as const).map(method => (
                          <Button
                            key={method}
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-14 text-base font-semibold transition-all",
                              formData.paymentMethod === method
                                ? method === 'bkash' ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300" : "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                : "hover:border-primary/40"
                            )}
                            onClick={() => setFormData(p => ({ ...p, paymentMethod: method }))}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            {method === 'bkash' ? 'bKash' : 'Nagad'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free session info banner */}
                  {selectedSession && isFree && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-4">
                      <Tag className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm">This is a Free Session</p>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-0.5">No payment required. Your booking will be confirmed immediately.</p>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                    onClick={handleDetailsSubmit}
                    disabled={
                      !formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType ||
                      (!isFree && !formData.paymentMethod)
                    }
                  >
                    {isFree ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" />Confirm Free Booking</>
                    ) : (
                      <>Continue to Payment <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        )}

        {/* Step 2: Payment Instructions */}
        {step === 'payment' && selectedSession && (
          <ScrollReveal direction="up">
            <Card className="max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Payment Instructions</CardTitle>
                <CardDescription>Send the payment to complete your booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-5 space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Session</span><span className="font-semibold text-foreground">{selectedSession.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold text-foreground">{selectedSession.duration_minutes} min</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold text-foreground">{formData.date ? format(formData.date, 'PPP') : ''}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold text-foreground">{formData.time} (GMT+6)</span></div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-lg"><span className="font-semibold text-foreground">Total Fee</span><span className="font-bold text-primary">৳{selectedSession.fee}</span></div>
                </div>

                <div className={cn(
                  "rounded-lg p-5 border-2",
                  formData.paymentMethod === 'bkash' ? "border-pink-400 bg-pink-50 dark:bg-pink-950/30" : "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                )}>
                  <h4 className="font-semibold text-foreground mb-2">
                    Send ৳{selectedSession.fee} to {formData.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}
                  </h4>
                  <p className="text-2xl font-mono font-bold text-foreground mb-2">
                    {formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paymentSettings?.additional_instructions}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-3">
                  <Timer className="h-4 w-4 flex-shrink-0" />
                  <span>You'll have <strong>{paymentSettings?.payment_window_minutes || 30} minutes</strong> to enter your transaction ID after clicking confirm.</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('details')}>Back</Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handlePaymentConfirm}>
                    I've Sent the Payment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 3: Transaction ID */}
        {step === 'transaction' && (
          <ScrollReveal direction="up">
            <Card className="max-w-lg mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Enter Transaction ID</CardTitle>
                <CardDescription>Submit your {formData.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} transaction ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {timeLeft && timeLeft !== 'Expired' && (
                  <div className="text-center bg-destructive/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
                    <p className="text-3xl font-mono font-bold text-destructive">{timeLeft}</p>
                  </div>
                )}
                {timeLeft === 'Expired' && (
                  <div className="text-center bg-destructive/10 rounded-lg p-4">
                    <p className="text-destructive font-semibold">Payment window expired. Please try booking again.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Transaction ID *</Label>
                  <Input
                    placeholder="Enter your transaction ID (e.g., TXN123456789)"
                    value={formData.transactionId}
                    onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                    className="text-center text-lg font-mono"
                  />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={handleTransactionSubmit}
                  disabled={!formData.transactionId.trim() || timeLeft === 'Expired'}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Step 4: Confirmed */}
        {step === 'confirmed' && (
          <ScrollReveal direction="up">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-10 space-y-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  isFree ? "bg-green-100 dark:bg-green-900/40" : "bg-primary/10"
                )}>
                  <CheckCircle2 className={cn("h-10 w-10", isFree ? "text-green-600 dark:text-green-400" : "text-primary")} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isFree ? 'Session Confirmed!' : 'Booking Submitted!'}
                </h2>
                <p className="text-muted-foreground">
                  {isFree
                    ? <>Your free session has been booked and confirmed. We'll send a reminder to <strong>{formData.email}</strong>.</>
                    : <>Your session booking has been submitted. We'll verify your payment and send a confirmation to <strong>{formData.email}</strong>.</>
                  }
                </p>
                <div className="bg-muted rounded-lg p-4 text-sm text-left space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono text-foreground">{bookingId.slice(0, 8)}...</span></div>
                  {!isFree && formData.transactionId && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono text-foreground">{formData.transactionId}</span></div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {isFree
                      ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Confirmed</Badge>
                      : <Badge className="bg-primary/10 text-primary">Pending Verification</Badge>
                    }
                  </div>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

export default BookSession;
