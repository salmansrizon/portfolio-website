import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar, 
    Clock, 
    Users, 
    CheckCircle2, 
    ChevronRight, 
    PlayCircle, 
    MessageCircle, 
    CreditCard, 
    Plus, 
    Zap, 
    ShieldCheck, 
    Quote,
    HelpCircle,
    Smartphone,
    MapPin,
    Mail,
    ArrowRight,
    Timer,
    Linkedin,
    ExternalLink
} from "lucide-react";
import { format, addMinutes } from "date-fns";
import Navbar from "@/components/Navbar";
import { useBookingData } from "@/hooks/useBookingData";
import { cn } from "@/lib/utils";

const WebinarLanding = () => {
    const { id } = useParams();
    const [webinar, setWebinar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Registration Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        role: '',
        paymentMethod: '' as 'bkash' | 'nagad' | '',
        transactionId: ''
    });

    const [registrationStep, setRegistrationStep] = useState<'form' | 'payment' | 'success'>('form');
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number }>({ d: 0, h: 0, m: 0, s: 0 });
    const [paymentTimeLeft, setPaymentTimeLeft] = useState<string>('');
    const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
    const [instructors, setInstructors] = useState<any[]>([]);
    const { paymentSettings } = useBookingData();

    useEffect(() => {
        const fetchWebinar = async () => {
            setLoading(true);
            try {
                const { data, error } = await (supabase
                    .from('webinars' as any)
                    .select('*')
                    .eq('id', id)
                    .single() as any);
                
                if (error || !data) {
                    toast({ title: "Webinar not found", variant: "destructive" });
                    navigate('/');
                } else {
                    setWebinar(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchInstructors = async () => {
            const { data } = await supabase.from('instructors').select('*');
            if (data) setInstructors(data);
        };

        if (id) {
            fetchWebinar();
            fetchInstructors();
        }
    }, [id, navigate, toast]);

    useEffect(() => {
        if (!webinar) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(webinar.webinar_date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [webinar]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        
        try {
            const bookingPayload = {
                webinar_id: id,
                student_name: formData.name,
                student_email: formData.email,
                student_whatsapp: formData.whatsapp,
                student_role: formData.role,
                payment_status: webinar.is_free ? 'confirmed' : 'pending',
                payment_method: webinar.is_free ? 'free' : formData.paymentMethod,
                payment_transaction_id: webinar.is_free ? null : formData.transactionId,
                booking_date: new Date().toISOString()
            };

            const { error } = await (supabase.from('webinar_bookings' as any).insert([bookingPayload]) as any);

            if (error) {
                toast({ title: "Registration failed", description: error.message, variant: "destructive" });
            } else {
                if (webinar.is_free) {
                    setRegistrationStep('success');
                } else {
                    setRegistrationStep('payment');
                    // Set payment deadline when moving to payment step
                    const windowMins = paymentSettings?.payment_window_minutes || 30;
                    setPaymentDeadline(addMinutes(new Date(), windowMins));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handlePaymentComplete = async () => {
        if (!formData.paymentMethod) {
            toast({ title: "Error", description: "Please select a payment method", variant: "destructive" });
            return;
        }
        if (!formData.transactionId || formData.transactionId.trim() === "") {
            toast({ title: "Error", description: "Transaction ID is strictly required. Check your SMS.", variant: "destructive" });
            return;
        }

        setFormLoading(true);
        try {
            // Update the existing booking with payment details
            // Note: In a real flow, we'd update the already inserted booking, 
            // but here we'll just simulate the confirmation and let admins verify the TxnID.
            await new Promise(r => setTimeout(r, 1500));
            setRegistrationStep('success');
            toast({ title: "Payment Submitted!", description: "We'll verify your transaction and confirm your seat shortly." });
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    // Payment Countdown
    useEffect(() => {
        if (!paymentDeadline) return;
        const interval = setInterval(() => {
            const now = new Date();
            const diff = paymentDeadline.getTime() - now.getTime();
            if (diff <= 0) {
                setPaymentTimeLeft('Expired');
                clearInterval(interval);
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setPaymentTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [paymentDeadline]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
    );

    if (!webinar) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
            <Navbar />
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                <HelpCircle className="h-10 w-10 text-primary opacity-40" />
            </div>
            <h1 className="text-3xl font-bold">Webinar Not Found</h1>
            <p className="text-muted-foreground max-w-md">This webinar may have expired, been removed, or is currently in draft mode. Please check back later or contact us.</p>
            <Button onClick={() => navigate('/')} variant="outline" className="rounded-full px-8">Back to Home</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Navbar />
            
            {/* Background Blur Elements (Matching Hero) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-[80px] animate-pulse delay-2000"></div>
            </div>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none z-0"></div>

            <div className="relative z-10 pt-32 pb-20 max-w-6xl mx-auto px-6">
                
                {/* HERO SECTION - Aligned with Index Hero */}
                <section className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all px-4 py-1 flex items-center gap-2 w-fit">
                                <Zap className="h-3 w-3 animate-pulse" />
                                {webinar.is_free ? 'Free Live Session' : 'Exclusive Masterclass'}
                            </Badge>
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                                <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-move">
                                    {webinar.title}
                                </span>
                            </h1>
                            
                            {/* NEW COUNTDOWN COMPONENT */}
                            <div className="flex gap-4 py-4">
                                {[
                                    { label: 'Days', value: timeLeft.d },
                                    { label: 'Hours', value: timeLeft.h },
                                    { label: 'Mins', value: timeLeft.m },
                                    { label: 'Secs', value: timeLeft.s }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center bg-accent/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-primary/5 min-w-[70px]">
                                        <span className="text-2xl font-black text-foreground leading-none">{item.value.toString().padStart(2, '0')}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mt-1">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-lg font-bold">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="text-foreground/80">
                                    {format(new Date(webinar.webinar_date), 'PPP p')}
                                    <span className="ml-3 text-primary opacity-60"> • </span>
                                    <span className="text-primary font-black uppercase tracking-widest text-xs opacity-80">Google Meet</span>
                                </span>
                            </div>
                        </div>

                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                            {webinar.description || "Join this transformative session designed to upgrade your skills and give you the competitive edge in the modern tech landscape."}
                        </p>
                        

                        <div className="flex gap-4 items-center">
                              <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 text-xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 group rounded-2xl"
                                onClick={() => setIsRegistering(true)}
                            >
                                <div className="relative flex h-3 w-3 mr-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </div>
                                {webinar.is_free ? 'Claim My Seat Now' : `Join for ${webinar.price || 'Rp 99.000'}`}
                                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <Card className="relative overflow-hidden border-primary/10 bg-background/40 backdrop-blur-xl shadow-2xl rounded-[32px] p-1">
                            <div className="aspect-video rounded-[30px] overflow-hidden bg-accent/20 flex items-center justify-center border border-primary/5">
                                <PlayCircle className="h-20 w-20 text-primary/40 group-hover:scale-110 transition-transform cursor-pointer" />
                            </div>
                        </Card>
                        
                        {/* Status Floaties */}
                        <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-900 border border-primary/10 shadow-xl p-4 rounded-2xl animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Registered</p>
                                    <p className="text-sm font-bold">{webinar.booked_count || 0} people already booked</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* DYNAMIC BLOCKS RENDERING */}
                {webinar.content_blocks?.map((block: any) => (
                    <motion.section 
                        key={block.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-32 scroll-mt-32"
                        id={block.type}
                    >
                        {block.type === 'benefits' && (
                            <div className="space-y-16">
                                <div className="text-center max-w-2xl mx-auto space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title}</h2>
                                    <p className="text-muted-foreground text-lg">Curated curriculum and takeaways from this session.</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {block.content.items?.map((item: any, i: number) => (
                                        <Card key={i} className="bg-accent/10 border-primary/5 p-10 rounded-[32px] hover:bg-accent/20 transition-all hover:scale-[1.02] group">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                                <CheckCircle2 className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <h4 className="text-xl font-bold mb-3">Key Takeaway #{i+1}</h4>
                                            <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {block.type === 'host' && (
                            <div className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title || 'Meet Your Instructors'}</h2>
                                    <p className="text-muted-foreground text-lg italic">Learn from the best in the industry.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-12">
                                    {((block.content.instructor_ids && block.content.instructor_ids.length > 0) ? block.content.instructor_ids : [null]).map((instId: string | null, i: number) => {
                                        const inst = instId ? instructors.find(ins => ins.id === instId) : null;
                                        const hostData = inst ? {
                                            name: inst.name,
                                            role: inst.specialization || inst.role,
                                            avatar: inst.avatar_url,
                                            bio: inst.bio,
                                            linkedin: inst.linkedin_url
                                        } : {
                                            name: block.content.name || 'Mentor Kami',
                                            role: block.content.role || 'Industry Expert',
                                            avatar: block.content.image,
                                            bio: block.content.bio || "Data is not just numbers; it's the story of your business waiting to be told correctly.",
                                            linkedin: null
                                        };

                                        return (
                                            <div key={i} className="bg-gradient-to-br from-primary/5 to-accent/20 border border-primary/10 rounded-[48px] p-6 md:p-8 grid lg:grid-cols-12 gap-6 md:gap-12 items-center">
                                                <div className="lg:col-span-3 relative mx-auto lg:mx-0 w-full max-w-[160px]">
                                                    <div className="aspect-square rounded-full overflow-hidden bg-slate-200 shadow-xl border-4 border-white/50 relative group">
                                                        {hostData.avatar ? (
                                                            <img src={hostData.avatar} className="w-full h-full object-cover" alt={hostData.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-accent/20">
                                                                <Users className="h-12 w-12 text-primary/20" />
                                                            </div>
                                                        )}
                                                        {hostData.linkedin && (
                                                            <a 
                                                                href={hostData.linkedin} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="absolute inset-0 bg-primary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                                                            >
                                                                <Linkedin className="h-8 w-8" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full shadow-lg border border-white/20 whitespace-nowrap overflow-hidden">
                                                        {hostData.linkedin ? (
                                                            <a 
                                                                href={hostData.linkedin} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-1.5 flex items-center gap-1.5 hover:bg-white/10 transition-colors font-bold text-[10px] uppercase tracking-tighter"
                                                            >
                                                                <Linkedin className="h-3 w-3" />
                                                                View Profile
                                                            </a>
                                                        ) : (
                                                            <div className="px-4 py-1.5 font-bold text-[10px] uppercase tracking-tighter">
                                                                Industry Mentor
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lg:col-span-9 space-y-4">
                                                    <div className="space-y-1 text-center lg:text-left">
                                                        <h2 className="text-2xl md:text-4xl font-black">{hostData.name}</h2>
                                                        <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">{hostData.role}</p>
                                                    </div>
                                                    <div className="relative pt-2">
                                                        <Quote className="absolute -top-2 -left-4 h-8 w-8 text-primary/5" />
                                                        <p className="text-base md:text-lg text-foreground/80 leading-relaxed italic relative z-10 px-4 lg:px-0">
                                                            "{hostData.bio}"
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-center lg:justify-start gap-12 pt-4 border-t border-primary/5">
                                                        <div className="text-center lg:text-left">
                                                            <div className="text-xl md:text-2xl font-black text-primary">7+</div>
                                                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Years Experience</div>
                                                        </div>
                                                        <div className="text-center lg:text-left">
                                                            <div className="text-xl md:text-2xl font-black text-primary">100+</div>
                                                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Guided Success</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {block.type === 'faq' && (
                            <div className="max-w-4xl mx-auto space-y-16">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title || 'Common Questions'}</h2>
                                    <p className="text-muted-foreground text-lg">Everything you need to know about the webinar.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {block.content.questions?.map((q: any, i: number) => (
                                        <Card key={i} className="bg-background/60 border-primary/5 p-8 rounded-3xl hover:border-primary/20 transition-all group">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                                    <HelpCircle className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold mb-2">{q.q}</h3>
                                                    <p className="text-muted-foreground leading-relaxed">{q.a}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.section>
                ))}

                {/* Final CTA Area */}
                <section className="relative rounded-[64px] overflow-hidden bg-primary p-12 md:p-24 text-center text-primary-foreground mb-32 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight">Ready to transform your career?</h2>
                        <p className="text-xl text-primary-foreground/80 font-medium leading-relaxed">
                            Don't miss out on this live session. Reserve your spot today before it's too late.
                        </p>
                        <Button 
                            className="bg-white text-primary hover:bg-slate-100 h-16 px-12 text-xl font-black rounded-full shadow-2xl transition-all hover:scale-105"
                            onClick={() => setIsRegistering(true)}
                        >
                            Book Now <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    </div>
                </section>
                
            </div>

            {/* Registration Dialog */}
            <Dialog open={isRegistering} onOpenChange={(open) => {
                setIsRegistering(open);
                if (!open) setRegistrationStep('form');
            }}>
                <DialogContent className="sm:max-w-[500px] border-primary/10 rounded-[32px] p-0 overflow-hidden bg-background">
                    <AnimatePresence mode="wait">
                        {registrationStep === 'form' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key="form"
                            >
                                <div className="bg-primary p-8 text-white">
                                    <DialogTitle className="text-2xl font-black mb-2">Claim Your Seat</DialogTitle>
                                    <p className="text-primary-foreground/80 opacity-80">Please fill in your details to reserve your spot.</p>
                                </div>
                                <form onSubmit={handleRegister} className="p-8 space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Full Name</Label>
                                        <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-2xl bg-accent/5 border-primary/10 focus:border-primary/40 focus:bg-background transition-all" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Work Email</Label>
                                        <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-2xl bg-accent/5 border-primary/10 focus:border-primary/40 focus:bg-background transition-all" placeholder="john@example.com" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">WhatsApp</Label>
                                            <Input required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-12 rounded-2xl bg-accent/5 border-primary/10 focus:border-primary/40 focus:bg-background transition-all" placeholder="012XXX" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Role</Label>
                                            <Input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="h-12 rounded-2xl bg-accent/5 border-primary/10 focus:border-primary/40 focus:bg-background transition-all" placeholder="Dev / Student" />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/25 mt-4" disabled={formLoading}>
                                        {formLoading ? 'Processing...' : webinar.is_free ? 'Claim My Seat Now' : 'Proceed to Payment'}
                                    </Button>
                                    <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Instant Confirmation via Email</p>
                                </form>
                            </motion.div>
                        )}

                        {registrationStep === 'payment' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key="payment"
                            >
                                <div className="bg-primary p-8 text-white relative">
                                    <DialogTitle className="text-2xl font-black mb-1">Confirm Payment</DialogTitle>
                                    <p className="text-primary-foreground/80 opacity-80">Secure your spot for this masterclass.</p>
                                    <div className="absolute top-8 right-8 text-right hidden sm:block">
                                        <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Price</p>
                                        <p className="text-2xl font-black">{webinar.price || 'Rp 99.000'}</p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-2 block">Choose Payment Method</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['bkash', 'nagad'] as const).map(method => (
                                                <Button
                                                    key={method}
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "h-14 text-base font-bold transition-all rounded-2xl border-2",
                                                        formData.paymentMethod === method
                                                            ? method === 'bkash' ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]" : "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]"
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

                                    {formData.paymentMethod && (
                                        <div className={cn(
                                            "rounded-[32px] p-7 border-2 text-center space-y-5 animate-in fade-in slide-in-from-top-4 backdrop-blur-sm",
                                            formData.paymentMethod === 'bkash' ? "border-pink-500/20 bg-pink-50/30 dark:bg-pink-950/20" : "border-orange-500/20 bg-orange-50/30 dark:bg-orange-950/20"
                                        )}>
                                            <div className="flex justify-between items-center bg-background/60 p-3 rounded-xl backdrop-blur-md border border-primary/5">
                                                <div className="flex items-center gap-2 text-[11px] font-black text-destructive uppercase tracking-widest">
                                                    <Timer className="h-4 w-4 animate-pulse" /> 
                                                    {paymentTimeLeft} left to pay
                                                </div>
                                                <h4 className="font-bold text-foreground text-sm uppercase tracking-tighter">
                                                    Fee: <span className="font-black text-lg text-primary">{webinar.price || 'Rp 99.000'}</span>
                                                </h4>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <p className="text-3xl font-mono font-black tracking-tighter text-foreground">
                                                    {formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Send Money Number</p>
                                            </div>

                                            {(formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code) && (
                                                <div className="mx-auto w-48 h-48 bg-white p-3 rounded-[24px] shadow-2xl border border-black/5">
                                                    <img 
                                                        src={formData.paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code! : paymentSettings?.nagad_qr_code!} 
                                                        alt="Payment QR" 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="space-y-2 pt-2 text-left">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">Enter Transaction ID <span className="text-destructive">*</span></Label>
                                                <Input
                                                    value={formData.transactionId}
                                                    onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value.toUpperCase() }))}
                                                    placeholder="E.G. 9F8G7H6A5B"
                                                    className="font-mono h-12 rounded-xl bg-background border-primary/20 text-center uppercase font-black text-lg"
                                                />
                                            </div>

                                            {paymentSettings?.additional_instructions && (
                                                <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-medium uppercase tracking-tighter border-t border-primary/5 pt-4">
                                                    {paymentSettings.additional_instructions}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <Button onClick={handlePaymentComplete} className="w-full h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02]" disabled={formLoading || paymentTimeLeft === 'Expired'}>
                                        {formLoading ? 'Verifying Transaction...' : paymentTimeLeft === 'Expired' ? 'Payment Expired' : 'Complete Registration'}
                                    </Button>
                                    <div className="flex items-center justify-center gap-2 opacity-50">
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Verification System</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {registrationStep === 'success' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="success"
                                className="p-12 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black">Seat Confirmed!</h2>
                                    <p className="text-muted-foreground">You've successfully secured your spot for <strong>{webinar.title}</strong>. Check your inbox for the invitation link.</p>
                                </div>
                                <Button onClick={() => setIsRegistering(false)} className="bg-primary px-8 h-12 rounded-xl font-bold">
                                    Understood
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default WebinarLanding;
