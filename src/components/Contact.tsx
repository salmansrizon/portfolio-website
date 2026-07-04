import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  MapPin, 
  Clock, 
  Linkedin, 
  Github, 
  Download,
  ExternalLink,
  Shield,
  Zap,
  Calendar as CalendarIcon,
  Video,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Timer,
  Smartphone,
  Phone
} from "lucide-react";
import { format, addMinutes } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";
import { useBookingData } from "@/hooks/useBookingData";
import { useSectionContent } from "@/hooks/useSectionContent";

type BookingStep = 'form' | 'confirmed';

const Contact = () => {
  const { content: sectionContent } = useSectionContent("contact", { title: "Let's Work Together", description: "Ready to transform your data into strategic insights?", email: "salmansrizon2016@gmail.com", phone: "", location: "Dhaka, Bangladesh" });
  const [currentTime, setCurrentTime] = useState('');
  const [isBusinessHours, setIsBusinessHours] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });

  // ── Booking state ──────────────────────────────────────────
  const {
    sessionTypes,
    paymentSettings,
    isDateUnavailable,
    getAllTimeSlotsWithAvailability,
    isLoading: bookingDataLoading,
    availabilitySettings,
  } = useBookingData();

  const [bookingStep, setBookingStep] = useState<BookingStep>('form');
  const [quickBook, setQuickBook] = useState({
    name: '',
    email: '',
    whatsapp: '',
    phone: '',
    sessionTypeId: '',
    date: undefined as Date | undefined,
    time: '',
    message: '',
    paymentMethod: '' as 'bkash' | 'nagad' | '',
    transactionId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  const { toast } = useToast();

  // ── Contact form submit (unchanged mailto) ─────────────────
  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const subject = `New Contact from ${formData.name}`;
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Service: ${formData.service || 'Not specified'}

Message:
${formData.message}
    `.trim();

    const mailtoUrl = `mailto:salmansrizon2016@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setFormData({ name: '', email: '', service: '', message: '' });
      toast({
        title: "Success",
        description: "Email client opened with your message. Please send the email to complete.",
      });
    }, 1000);
  };

  const selectedSession = sessionTypes.find(s => s.id === quickBook.sessionTypeId);
  const isFreeSession = selectedSession ? !selectedSession.is_paid : false;

  // ── Step 1 → 2: Validate details, save booking (or confirm for free) ─
  const handleBookingSubmit = async () => {
    const paymentRequired = !isFreeSession;
    if (!quickBook.name || !quickBook.email || !quickBook.sessionTypeId || !quickBook.date || !quickBook.time || (paymentRequired && !quickBook.paymentMethod)) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (!isFreeSession && !quickBook.transactionId.trim()) {
      toast({ title: "Error", description: "Please enter your transaction ID", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('session_bookings').insert({
        session_type_id: quickBook.sessionTypeId,
        user_name: quickBook.name,
        user_email: quickBook.email,
        whatsapp_number: quickBook.whatsapp,
        phone_number: quickBook.phone,
        booking_date: format(quickBook.date!, 'yyyy-MM-dd'),
        time_slot: quickBook.time,
        payment_method: isFreeSession ? 'free' : quickBook.paymentMethod,
        fee_amount: isFreeSession ? 0 : selectedSession.fee,
        payment_status: isFreeSession ? 'not_required' : 'submitted',
        booking_status: isFreeSession ? 'confirmed' : 'pending',
        transaction_id: isFreeSession ? null : quickBook.transactionId,
        payment_deadline: paymentDeadline?.toISOString(),
      }).select().single();

      if (error) throw error;
      if (data) setBookingId(data.id);
      setBookingStep('confirmed');
      toast({ title: "Booking Confirmed!", description: isFreeSession ? "Your free session has been booked successfully." : "Your session booking has been submitted. We'll verify your payment and confirm shortly." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create booking", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPaymentMethod = (method: 'bkash' | 'nagad') => {
    setQuickBook(p => ({ ...p, paymentMethod: method }));
    if (!paymentDeadline) {
      const windowMins = paymentSettings?.payment_window_minutes || 30;
      setPaymentDeadline(addMinutes(new Date(), windowMins));
    }
  };

  const resetBooking = () => {
    setQuickBook({ name: '', email: '', whatsapp: '', phone: '', sessionTypeId: '', date: undefined, time: '', message: '', paymentMethod: '', transactionId: '' });
    setBookingStep('form');
    setBookingId('');
    setPaymentDeadline(null);
    setTimeLeft('');
  };

  // ── Countdown timer ────────────────────────────────────────
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

  // ── Clock ──────────────────────────────────────────────────
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000));

      const timeString = gmt6Time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });

      setCurrentTime(timeString);
      const hour = gmt6Time.getUTCHours();
      setIsBusinessHours(hour >= 9 && hour < 18);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // selectedSession is declared above near line 113

  // Step labels for the mini progress bar
  // Removed because it's a single form now

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{sectionContent.title}</h2>
            <p className="text-xl text-muted-foreground text-primary font-semibold">
              {sectionContent.description}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact & Booking Forms */}
          <ScrollReveal direction="left">
            <Card className="shadow-card hover:shadow-hover transition-all hover:border-primary/20">
            <CardContent className="p-0">
              <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Message
                  </TabsTrigger>
                  <TabsTrigger value="booking" className="flex items-center gap-2" onClick={() => bookingStep === 'confirmed' && resetBooking()}>
                    <Video className="h-4 w-4" />
                    Book Session
                  </TabsTrigger>
                </TabsList>

                {/* ─── Contact Form Tab (unchanged) ─── */}
                <TabsContent value="contact" className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="Your name" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Needed</Label>
                    <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="power-bi">Power BI Consulting</SelectItem>
                        <SelectItem value="data-engineering">Data Engineering</SelectItem>
                        <SelectItem value="fabric">Microsoft Fabric Implementation</SelectItem>
                        <SelectItem value="training">Training & Mentoring</SelectItem>
                        <SelectItem value="custom">Custom Analytics Solutions</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Describe your project or requirements..."
                      className="min-h-[120px]"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                    <div className="text-right text-sm text-muted-foreground">
                      {formData.message.length}/2000
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.email || !formData.message}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>

                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Protected by spam detection and rate limiting
                  </div>
                </TabsContent>

                {/* ─── Booking Tab (full flow) ─── */}
                <TabsContent value="booking" className="p-6 space-y-5">
                  {/* Progress bar removed as it's a single form now */}

                  {/* ── Step 1: Details form ── */}
                  {bookingStep === 'form' && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="qb-name">Name *</Label>
                          <Input
                            id="qb-name"
                            placeholder="Your name"
                            value={quickBook.name}
                            onChange={e => setQuickBook(p => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qb-email">Email *</Label>
                          <Input
                            id="qb-email"
                            type="email"
                            placeholder="your@email.com"
                            value={quickBook.email}
                            onChange={e => setQuickBook(p => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* WhatsApp & Phone */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>WhatsApp Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="01XXXXXXXXX"
                              value={quickBook.whatsapp}
                              onChange={e => setQuickBook(p => ({ ...p, whatsapp: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="01XXXXXXXXX"
                              value={quickBook.phone}
                              onChange={e => setQuickBook(p => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Session Type */}
                      <div className="space-y-2">
                        <Label>Session Type *</Label>
                        <Select
                          value={quickBook.sessionTypeId}
                          onValueChange={v => setQuickBook(p => ({ ...p, sessionTypeId: v }))}
                          disabled={bookingDataLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={bookingDataLoading ? "Loading…" : "Select session type"} />
                          </SelectTrigger>
                          <SelectContent>
                            {sessionTypes.map(st => (
                              <SelectItem key={st.id} value={st.id}>
                                {st.title} — {st.duration_minutes} min (৳{st.fee})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSession?.description && (
                          <p className="text-xs text-muted-foreground">{selectedSession.description}</p>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {quickBook.date ? format(quickBook.date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={quickBook.date}
                                onSelect={date => setQuickBook(p => ({ ...p, date, time: '' }))}
                                disabled={date =>
                                  date < new Date() ||
                                  !availabilitySettings.available_weekdays.includes(date.getDay()) ||
                                  isDateUnavailable(date)
                                }
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Time Slot *</Label>
                          <Select value={quickBook.time} onValueChange={v => setQuickBook(p => ({ ...p, time: v }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAllTimeSlotsWithAvailability(quickBook.date).map(t => (
                                <SelectItem key={t.time} value={t.time} disabled={!t.available}>
                                  {t.time} (GMT+6) {!t.available && "(Booked)"}
                                </SelectItem>
                              ))}
                              {getAllTimeSlotsWithAvailability(quickBook.date).length === 0 && (
                                <SelectItem value="" disabled>No available slots</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Payment Method - only for paid sessions */}
                      {selectedSession && !isFreeSession && (
                        <div className="space-y-2">
                          <Label>Payment Method *</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['bkash', 'nagad'] as const).map(method => (
                              <Button
                                key={method}
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-12 text-sm font-semibold transition-all",
                                  quickBook.paymentMethod === method
                                    ? method === 'bkash'
                                      ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                                      : "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                    : "hover:border-primary/40"
                                )}
                                onClick={() => handleSelectPaymentMethod(method)}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                {method === 'bkash' ? 'bKash' : 'Nagad'}
                              </Button>
                            ))}
                          </div>

                          {/* Display QR & transaction input inline if selected and not expired */}
                          {quickBook.paymentMethod && timeLeft !== 'Expired' && (
                            <div className={cn(
                              "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                              quickBook.paymentMethod === 'bkash' ? "border-pink-400 bg-pink-50 dark:bg-pink-950/20" : "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
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
                                {quickBook.paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                              </p>

                              {(quickBook.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code) && (
                                <div className="mx-auto w-44 h-44 bg-white p-2 rounded-xl shadow-sm my-4">
                                  <img 
                                    src={quickBook.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code! : paymentSettings?.nagad_qr_code!} 
                                    alt={`${quickBook.paymentMethod} QR Code`} 
                                    className="w-full h-full object-contain"
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
                                <Label htmlFor="txnId" className="font-semibold text-sm">Enter Transaction ID <span className="text-red-500">*</span></Label>
                                <Input
                                  id="txnId"
                                  value={quickBook.transactionId}
                                  onChange={e => setQuickBook(p => ({ ...p, transactionId: e.target.value }))}
                                  placeholder="e.g., 9F8G7H6A5B"
                                  className="font-mono h-11 uppercase bg-background"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!isFreeSession && timeLeft === 'Expired' && selectedSession && (
                        <div className="bg-destructive/10 rounded-lg p-4 text-center">
                          <p className="text-destructive font-semibold">Payment window expired.</p>
                          <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>Reload Page to Try Again</Button>
                        </div>
                      )}

                      {/* Free session info banner */}
                      {selectedSession && isFreeSession && (
                        <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-300 text-sm">This is a Free Session</p>
                            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-0.5">No payment required. Your booking will be confirmed immediately.</p>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleBookingSubmit}
                        disabled={
                          timeLeft === 'Expired' ||
                          isSubmitting ||
                          !quickBook.name ||
                          !quickBook.email ||
                          !quickBook.sessionTypeId ||
                          !quickBook.date ||
                          !quickBook.time ||
                          (!isFreeSession && (!quickBook.paymentMethod || !quickBook.transactionId.trim()))
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />{isFreeSession ? (isSubmitting ? "Booking…" : "Confirm Free Booking") : (isSubmitting ? "Processing…" : "Confirm Booking")}
                      </Button>
                    </>
                  )}

                  {/* ── Step 4: Confirmed ── */}
                  {bookingStep === 'confirmed' && (
                    <div className="text-center space-y-5 py-2">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {isFreeSession ? "Booking Confirmed!" : "Booking Submitted!"}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {isFreeSession
                          ? <>Your free session has been confirmed! A confirmation will be sent to <strong>{quickBook.email}</strong>.</>
                          : <>We'll verify your payment and send a confirmation to <strong>{quickBook.email}</strong>.</>
                        }
                      </p>
                      <div className="bg-muted rounded-lg p-3 text-sm text-left space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono text-foreground">{bookingId.slice(0, 8)}…</span></div>
                        {!isFreeSession && quickBook.transactionId && (
                          <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono text-foreground">{quickBook.transactionId}</span></div>
                        )}
                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                          <Badge className="bg-primary/10 text-primary">
                            {isFreeSession ? "Confirmed" : "Pending Verification"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetBooking}>
                        Book Another Session
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          </ScrollReveal>

          {/* Contact Info */}
          <ScrollReveal direction="right">
            <div className="space-y-8">
            {/* Availability */}
            <Card className="shadow-card hover:shadow-hover transition-all hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{sectionContent.location}</span>
                  </div>
                  <Badge 
                    className={cn(
                      "flex items-center gap-1.5 transition-all duration-500",
                      isBusinessHours 
                        ? "bg-success-soft text-success border-success/20"
                        : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                    )}
                  >
                    {isBusinessHours && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                    )}
                    {isBusinessHours ? "Available" : "Away"}
                  </Badge>
                </div>
                
                <div className="text-2xl font-bold text-primary">{currentTime}</div>
                <div className="text-muted-foreground">
                  Current Local Time (GMT+6)
                </div>
                <div className="text-sm text-muted-foreground">
                  Business Hours: 9:00 AM - 6:00 PM (Bangladesh Time)
                </div>
              </CardContent>
            </Card>

            {/* Connect Links */}
            <Card className="shadow-card hover:shadow-hover transition-all hover:border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Connect With Me
                </CardTitle>
                <p className="text-muted-foreground">
                  Prefer a direct approach? Connect with me on your favorite platform.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://www.linkedin.com/in/salman-srizon-252b79125/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://github.com/salmansrizon" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://www.fiverr.com/sellers/salmansrizon/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Fiverr
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://drive.google.com/file/d/1hvHqSX_aD5y06Rq1emKtlWiFuqrnNIjE/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Resume
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Response */}
            <Card className="shadow-card bg-gradient-hero text-white border-primary/20 backdrop-blur-md hover:shadow-hover transition-all">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Zap className="h-8 w-8 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quick Response Guarantee</h3>
                    <p className="opacity-90 mb-4 leading-relaxed">
                      I typically respond to all inquiries within <strong>24 hours</strong>. 
                      For urgent projects, LinkedIn is the fastest way to reach me.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
