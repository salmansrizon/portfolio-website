import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import LottieAnimation from "@/components/LottieAnimation";
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
import { CalendarIcon, Clock, Phone, Mail, User, CreditCard, CheckCircle2, Timer, ArrowRight, Smartphone, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingData } from "@/hooks/useBookingData";
import { usePageView } from "@/hooks/usePageView";



type Step = 'details' | 'confirmed';

const BookSession = () => {
  usePageView("/book-session");
  const { toast } = useToast();
  const { sessionTypes, paymentSettings, unavailableSlots, isDateUnavailable, getAllTimeSlotsWithAvailability, availabilitySettings } = useBookingData();
  const [step, setStep] = useState<Step>('details');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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

  const handleBookingSubmit = async () => {
    const paymentMethodRequired = !isFree;
    if (!formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType || (paymentMethodRequired && !formData.paymentMethod)) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (!isFree) {
      if (!formData.paymentMethod) {
        toast({ title: "Error", description: "Please select a payment method.", variant: "destructive" });
        return;
      }
      if (!formData.transactionId || formData.transactionId.trim() === "") {
        toast({ title: "Error", description: "Transaction ID is strictly required for paid bookings. Check your SMS.", variant: "destructive" });
        return;
      }
      if (timeLeft === 'Expired') {
        toast({ title: "Error", description: "Payment window has expired. Please reload to try again.", variant: "destructive" });
        return;
      }
    }

    try {
      const { data, error } = await supabase.from('session_bookings').insert({
        session_type_id: selectedSessionType,
        user_name: formData.name,
        user_email: formData.email,
        whatsapp_number: formData.whatsapp,
        phone_number: formData.phone,
        booking_date: format(formData.date, 'yyyy-MM-dd'),
        time_slot: formData.time,
        payment_method: isFree ? 'free' : formData.paymentMethod,
        fee_amount: isFree ? 0 : selectedSession.fee,
        payment_status: isFree ? 'not_required' : 'submitted',
        booking_status: isFree ? 'confirmed' : 'pending',
        transaction_id: isFree ? null : formData.transactionId,
        payment_deadline: paymentDeadline?.toISOString(),
      }).select().single();

      if (error) throw error;
      if (data) setBookingId(data.id);
      setStep('confirmed');
      toast({ title: "Booking Confirmed!", description: isFree ? "Your free session has been booked successfully." : "Your session booking has been submitted. We'll verify your payment and confirm shortly." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create booking", variant: "destructive" });
    }
  };

  const handleSelectPaymentMethod = (method: 'bkash' | 'nagad') => {
    setFormData(p => ({ ...p, paymentMethod: method }));
    if (!paymentDeadline) {
      const windowMins = paymentSettings?.payment_window_minutes || 30;
      setPaymentDeadline(addMinutes(new Date(), windowMins));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="mb-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8">
            <LottieAnimation
              src="/animations/booking-schedule.json"
              className="w-44 h-44 md:w-56 md:h-56 shrink-0"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-foreground mb-3">Book a Private Session</h1>
              <p className="text-lg text-muted-foreground">Schedule your 1-on-1 consultation session</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Header omitted from steps rendering because it's a single form now */}

        {/* Step 1: Details */}
        {step === 'details' && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Session Types */}
              <div className="md:col-span-1 flex flex-col">
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Session</h3>
                <div className="space-y-4 overflow-y-auto max-h-[650px] pr-2 pb-2 shrink-0">
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
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                             <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                             </div>
                             <h4 className="font-semibold text-foreground">{st.title}</h4>
                          </div>
                          <button 
                            type="button"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors flex-shrink-0"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setExpandedCard(expandedCard === st.id ? null : st.id); 
                            }}
                          >
                             {expandedCard === st.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className={`text-sm text-muted-foreground mt-2 ${expandedCard === st.id ? '' : 'line-clamp-1'}`}>{st.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{st.duration_minutes} min</Badge>
                          {st.is_paid ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">৳{st.fee}</Badge>
                          ) : (
                            <Badge className="bg-success-soft text-success-foreground hover:bg-success-soft/80">
                              <Tag className="h-3 w-3 mr-1" />Free
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                          {getAllTimeSlotsWithAvailability(formData.date).map(t => (
                            <SelectItem key={t.time} value={t.time} disabled={!t.available}>
                              {t.time} (GMT+6) {!t.available && "(Booked)"}
                            </SelectItem>
                          ))}
                          {getAllTimeSlotsWithAvailability(formData.date).length === 0 && (
                            <SelectItem value="" disabled>No available slots</SelectItem>
                          )}
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
                                ? method === 'bkash' ? "border-brand-bkash bg-brand-bkash-soft text-brand-bkash-soft-foreground" : "border-brand-nagad bg-brand-nagad-soft text-brand-nagad-soft-foreground"
                                : "hover:border-primary/40"
                            )}
                            onClick={() => handleSelectPaymentMethod(method)}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            {method === 'bkash' ? 'bKash' : 'Nagad'}
                          </Button>
                        ))}
                      </div>

                      {/* Display QR & transaction input inline if selected and not expired */}
                      {formData.paymentMethod && timeLeft !== 'Expired' && (
                        <div className={cn(
                          "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                          formData.paymentMethod === 'bkash' ? "border-brand-bkash/60 bg-brand-bkash-soft" : "border-brand-nagad/60 bg-brand-nagad-soft"
                        )}>
                          <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg backdrop-blur-sm">
                             <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                                <Timer className="h-4 w-4" /> 
                                {timeLeft} left to pay
                             </div>
                             <h4 className="font-semibold text-foreground text-sm">
                               Fee: <span className="font-bold text-lg text-primary">৳{selectedSession.fee}</span>
                             </h4>
                          </div>
                          
                          <p className="text-2xl font-mono font-bold text-foreground">
                            {formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                          </p>

                          {(formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code) && (
                            <div className="mx-auto w-44 h-44 bg-white p-2 rounded-xl shadow-sm my-4">
                              <img 
                                src={formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code! : paymentSettings?.nagad_qr_code!} 
                                alt={`${formData.paymentMethod} QR Code`} 
                                className="w-full h-full object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                          
                          <p className="text-sm font-medium opacity-80 max-w-[280px] mx-auto">
                            Scan the QR code or send money directly with proper details as a reference.
                          </p>

                          {paymentSettings?.additional_instructions && (
                            <p className="text-sm text-muted-foreground pt-2 border-t border-black/10 dark:border-white/10">
                              {paymentSettings.additional_instructions}
                            </p>
                          )}

                          <div className="space-y-1.5 pt-4 text-left">
                            <Label htmlFor="txnId" className="font-semibold text-sm">Enter Transaction ID <span className="text-destructive">*</span></Label>
                            <Input
                              id="txnId"
                              value={formData.transactionId}
                              onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                              placeholder="e.g., 9F8G7H6A5B"
                              className="font-mono h-11 uppercase bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Free session info banner */}
                  {selectedSession && isFree && (
                    <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                      <Tag className="h-5 w-5 text-success flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-success-foreground text-sm">This is a Free Session</p>
                        <p className="text-xs text-success/80 mt-0.5">No payment required. Your booking will be confirmed immediately.</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    {timeLeft === 'Expired' && !isFree && (
                      <div className="bg-destructive/10 rounded-lg p-4 text-center">
                        <p className="text-destructive font-semibold">Payment window expired.</p>
                        <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>Reload Page to Try Again</Button>
                      </div>
                    )}

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      onClick={handleBookingSubmit}
                      disabled={
                        timeLeft === 'Expired' ||
                        !formData.name || !formData.email || !formData.date || !formData.time || !selectedSessionType ||
                        (!isFree && (!formData.paymentMethod || !formData.transactionId.trim()))
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />{isFree ? "Confirm Free Booking" : "Confirm Booking"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        )}

        {/* Step 4: Confirmed */}
        {step === 'confirmed' && (
          <ScrollReveal direction="up">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-10 space-y-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  isFree ? "bg-success-soft" : "bg-primary/10"
                )}>
                  <CheckCircle2 className={cn("h-10 w-10", isFree ? "text-success" : "text-primary")} />
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
                      ? <Badge className="bg-success-soft text-success-foreground">Confirmed</Badge>
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
