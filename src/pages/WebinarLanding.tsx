import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useBookingData } from "@/hooks/useBookingData";
import { cn } from "@/lib/utils";
import PaymentModal, { PaymentModalData } from "@/components/PaymentModal";

const WebinarLanding = () => {
    const { id } = useParams();
    const [webinar, setWebinar] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    // Form loading and error handling
    const [formLoading, setFormLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number }>({ d: 0, h: 0, m: 0, s: 0 });
    const [instructors, setInstructors] = useState<any[]>([]);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);
    const [isHeroExpanded, setIsHeroExpanded] = useState(false);
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

    const handleRegister = async (data: PaymentModalData) => {
        setFormLoading(true);
        try {
            const bookingPayload = {
                webinar_id: id,
                student_name: data.name,
                student_email: data.email,
                student_whatsapp: data.whatsapp,
                student_role: data.extras.role,
                payment_status: webinar.is_free ? 'confirmed' : 'pending',
                payment_method: webinar.is_free ? 'free' : data.paymentMethod,
                payment_transaction_id: webinar.is_free ? null : data.transactionId,
                booking_date: new Date().toISOString(),
                promo_code: data.promoCode || null,
                discount_amount: data.discountAmount || null,
            };

            const { error } = await (supabase.from('webinar_bookings' as any).insert([bookingPayload]) as any);

            if (error) {
                throw error;
            }

            if (data.promoCode) {
                await (supabase.rpc('increment_promo_code_usage' as any, { code_input: data.promoCode }) as any);
            }

            toast({ title: "Success!", description: webinar.is_free ? "Registration confirmed!" : "Payment submitted for verification." });
        } catch (err: any) {
            console.error(err);
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

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
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
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
                                    {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.title || webinar.title}
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

                        <div className="space-y-4">
                            <motion.div
                                animate={{ height: 'auto' }}
                                className="relative"
                            >
                                <p className={cn(
                                    "text-lg text-muted-foreground leading-relaxed max-w-xl transition-all duration-300",
                                    !isHeroExpanded && "line-clamp-3"
                                )}>
                                    {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.subtitle || 
                                     webinar.description || 
                                     "Join this transformative session designed to upgrade your skills and give you the competitive edge in the modern tech landscape."}
                                </p>
                            </motion.div>
                            
                            {(webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.subtitle?.length > 180 || webinar.description?.length > 180) && (
                                <button 
                                    onClick={() => setIsHeroExpanded(!isHeroExpanded)}
                                    className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                                >
                                    {isHeroExpanded ? 'Show Less' : 'Show More'}
                                    <ChevronRight className={cn("h-4 w-4 transition-transform", isHeroExpanded && "rotate-90")} />
                                </button>
                            )}
                        </div>


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
                                {webinar.is_free ? 'Join for Free' : 'Claim My Seat Now'}
                                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <Card className="relative overflow-hidden border-primary/20 bg-background/40 backdrop-blur-xl shadow-2xl rounded-[32px] p-1">
                            <div className="aspect-video rounded-[30px] overflow-hidden bg-accent/20 flex items-center justify-center border border-primary/5 relative group/media">
                                {webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.videoUrl ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${webinar.content_blocks.find((b: any) => b.type === 'hero').content.videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1]}?autoplay=0&rel=0&modestbranding=1`}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title="Webinar Preview"
                                    />
                                ) : webinar.content_blocks?.find((b: any) => b.type === 'hero')?.content?.imageUrl ? (
                                    <img 
                                        src={webinar.content_blocks.find((b: any) => b.type === 'hero').content.imageUrl} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" 
                                        alt="Presentation" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden group/fallback">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/10 to-indigo-500/20 group-hover/fallback:rotate-12 transition-transform duration-1000" />
                                        <PlayCircle className="h-20 w-20 text-primary/40 group-hover/fallback:scale-110 transition-transform cursor-pointer z-10" />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Status Floaties */}
                        <Card className="absolute -top-6 -right-6 bg-white/90 dark:bg-slate-900/90 border-primary/10 shadow-2xl p-4 rounded-2xl animate-float backdrop-blur-md z-30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center ring-4 ring-success/5">
                                    <Users className="h-5 w-5 text-success" />
                                </div>
                                <div className="pr-4">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black leading-none mb-1">Registered</p>
                                    <p className="text-sm font-black whitespace-nowrap">{webinar.booked_count || 0} people joined</p>
                                </div>
                            </div>
                        </Card>
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
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {block.content.items?.map((item: any, i: number) => (
                                        <Card 
                                            key={i} 
                                            className={cn(
                                                "bg-accent/10 border-primary/5 p-3 px-5 rounded-xl hover:bg-accent/20 transition-all group flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm",
                                                expandedIdx === i && "bg-accent/20 border-primary/20"
                                            )}
                                            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                    <CheckCircle2 className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <h4 className="text-lg font-bold">
                                                        {item.title || `Key Takeaway #${i + 1}`}
                                                    </h4>
                                                    <ChevronRight className={cn(
                                                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                                        expandedIdx === i && "rotate-90"
                                                    )} />
                                                </div>
                                            </div>
                                            
                                            <motion.div
                                                initial={false}
                                                animate={{ height: expandedIdx === i ? 'auto' : 0, opacity: expandedIdx === i ? 1 : 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-12 pt-2 border-l-2 border-primary/10 ml-4 mb-2">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {item.description || item.text}
                                                    </p>
                                                </div>
                                            </motion.div>
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
                                            <div key={i} className="relative group/card w-full overflow-hidden">
                                                {/* Ambient Background Glow - Blue Theme */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-400/5 to-primary/10 opacity-30 group-hover/card:opacity-60 transition-opacity duration-700 blur-3xl " />
                                                
                                                <div className="relative bg-primary/[0.03] dark:bg-primary/[0.05] backdrop-blur-2xl border border-primary/20 rounded-[40px] p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center w-full min-h-[200px] shadow-[0_8px_32px_0_rgba(59,130,246,0.05)]">
                                                    
                                                    <div className="md:col-span-3 flex justify-center md:justify-end">
                                                        <div className="relative group/avatar">
                                                            {/* Ring effect */}
                                                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-blue-400 scale-105 opacity-0 group-hover/avatar:opacity-20 transition-opacity duration-500 blur-sm" />
                                                            
                                                            <div className="relative w-36 h-36 md:w-40 md:h-40">
                                                                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border-4 border-white dark:border-slate-800 relative z-10">
                                                                    {hostData.avatar ? (
                                                                        <img src={hostData.avatar} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" alt={hostData.name} />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-accent/20">
                                                                            <Users className="h-12 w-12 text-primary/20" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                                                                    <div className="relative group/badge">
                                                                        <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover/badge:opacity-40 transition-opacity" />
                                                                        {hostData.linkedin ? (
                                                                            <a
                                                                                href={hostData.linkedin}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="relative px-5 py-2 bg-primary text-white rounded-full flex items-center gap-2 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                                                                            >
                                                                                <Linkedin className="h-3 w-3" />
                                                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">VIEW PROFILE</span>
                                                                            </a>
                                                                        ) : (
                                                                            <div className="relative px-5 py-2 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-[0.1em] shadow-lg border border-white/20">
                                                                                Lead Instructor
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-9 flex flex-col justify-center space-y-6">
                                                        <div className="space-y-3 text-center md:text-left">
                                                            <div className="space-y-1">
                                                                <p className="text-primary font-black tracking-[0.3em] uppercase text-[10px] opacity-70">The Host</p>
                                                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                                                    {hostData.name}
                                                                </h2>
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                                                    <p className="text-primary font-bold text-[9px] uppercase tracking-widest">{hostData.role}</p>
                                                                </div>
                                                                <div className="flex gap-6 items-center">
                                                                    <div className="group/stat">
                                                                        <div className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none group-hover/stat:text-primary transition-colors">7+</div>
                                                                        <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">Years Experience</div>
                                                                    </div>
                                                                    <div className="w-px h-6 bg-primary/20" />
                                                                    <div className="group/stat">
                                                                        <div className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none group-hover/stat:text-primary transition-colors">100+</div>
                                                                        <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60 font-bold">Guided Success</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative max-w-2xl">
                                                            <Quote className="absolute -top-4 -left-6 h-10 w-10 text-primary/10" />
                                                            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10 px-2 md:px-0 font-medium">
                                                                "{hostData.bio}"
                                                            </p>
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
                                    <h2 className="text-3xl md:text-5xl font-bold">{block.title === 'Faq' || block.title === 'FAQ' ? 'Frequently Asked Questions' : (block.title || 'Frequently Asked Questions')}</h2>
                                    <p className="text-muted-foreground text-lg">Everything you need to know about the webinar.</p>
                                </div>
                                <div className="space-y-6">
                                    {block.content.questions?.map((q: any, i: number) => (
                                        <Card 
                                            key={i} 
                                            className={cn(
                                                "bg-accent/10 border-primary/5 p-3 px-5 rounded-xl hover:bg-accent/20 transition-all group flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm",
                                                expandedFaqIdx === i && "bg-accent/20 border-primary/20"
                                            )}
                                            onClick={() => setExpandedFaqIdx(expandedFaqIdx === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                                    <HelpCircle className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <h3 className="text-lg font-bold">{q.q}</h3>
                                                    <ChevronRight className={cn(
                                                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                                        expandedFaqIdx === i && "rotate-90"
                                                    )} />
                                                </div>
                                            </div>
                                            
                                            <motion.div
                                                initial={false}
                                                animate={{ height: expandedFaqIdx === i ? 'auto' : 0, opacity: expandedFaqIdx === i ? 1 : 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-12 pt-2 border-l-2 border-primary/10 ml-4 mb-2">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {q.a}
                                                    </p>
                                                </div>
                                            </motion.div>
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
                            className="bg-white text-primary hover:bg-white/90 h-16 px-12 text-xl font-black rounded-full shadow-2xl transition-all hover:scale-105"
                            onClick={() => setIsRegistering(true)}
                        >
                            {webinar.is_free ? 'Join for Free' : 'Claim My Seat Now'} <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                    </div>
                </section>

            </div>

            {/* Registration Dialog */}
            <PaymentModal
                open={isRegistering}
                onOpenChange={setIsRegistering}
                title={webinar.title}
                isFree={webinar.is_free}
                priceLabel={webinar.is_free ? undefined : `৳${webinar.price}`}
                originalAmount={webinar.is_free ? undefined : webinar.price}
                webinarId={id}
                onSubmit={handleRegister}
                extraFields={[
                    { key: 'role', label: 'Role / Profession', placeholder: 'e.g. Student, UX Designer', required: true }
                ]}
                submitLabel="Complete Registration"
            />

        </div>
    );
};

export default WebinarLanding;
