import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const WebinarFloatingButton = () => {
    const location = useLocation();
    const [webinar, setWebinar] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
    const [shouldShow, setShouldShow] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchUpcomingWebinar = async () => {
            try {
                const { data, error } = await (supabase
                    .from('webinars' as any)
                    .select('*')
                    .eq('status', 'published')
                    .gt('webinar_date', new Date().toISOString())
                    .order('webinar_date', { ascending: true })
                    .limit(1) as any);
                
                if (data && data.length > 0) {
                    setWebinar(data[0]);
                    
                    const timer = setTimeout(() => {
                        setShouldShow(true);
                    }, 2000);
                    
                    return () => clearTimeout(timer);
                }
            } catch (err) {
                console.error('Error fetching webinar for float:', err);
            }
        };

        fetchUpcomingWebinar();

        const handleScroll = () => {
            // Threshold for hero section in mobile
            setIsScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!webinar) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(webinar.webinar_date).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null);
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

    const isExcludedPage = location.pathname.startsWith('/webinar/') || 
                           location.pathname.startsWith('/career-prep/') ||
                           location.pathname.startsWith('/admin');

    if (!webinar || !shouldShow || isExcludedPage) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={isMobile ? (isScrolled ? 'mobile-top' : 'mobile-bottom') : 'desktop'}
                initial={{ opacity: 0, y: isMobile && isScrolled ? -50 : 50, x: isMobile ? '-50%' : 0 }}
                animate={{ opacity: 1, y: 0, x: isMobile ? '-50%' : 0 }}
                exit={{ opacity: 0, y: isMobile && isScrolled ? -50 : 50, x: isMobile ? '-50%' : 0 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                className={cn(
                    "fixed z-[45] transition-all duration-500",
                    isMobile 
                        ? isScrolled 
                            ? "top-20 left-1/2 w-[calc(100%-48px)] max-w-md" 
                            : "bottom-10 left-1/2 w-[calc(100%-48px)] max-w-md"
                        : "bottom-8 left-8 w-fit max-w-md"
                )}
                style={{ 
                    left: isMobile ? '50%' : '2rem', 
                    transform: isMobile ? 'translateX(-50%)' : 'none',
                    top: (isMobile && isScrolled) ? '5rem' : 'auto',
                    bottom: (isMobile && isScrolled) ? 'auto' : (isMobile ? '2.5rem' : '2rem')
                }}
            >
                <Link to={`/webinar/${webinar.id}`} className="block">
                    <div className={`group relative bg-card/70 backdrop-blur-3xl border border-primary/20 p-2 pl-3 md:pl-4 md:pr-2 md:py-2 transition-all duration-500 ring-1 ring-border rounded-[20px] shadow-2xl flex items-center justify-between gap-3 hover:border-primary/40 hover:scale-[1.01] cursor-pointer`}>
                        
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="relative flex items-center justify-center shrink-0 w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-full">
                                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-success opacity-40"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 leading-none mb-1 truncate">Live Webinar</span>
                                <h3 className={`font-bold text-foreground leading-none truncate pr-2 text-xs md:text-sm`}>{webinar.title}</h3>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                            {timeLeft && (
                                <div className="flex items-center gap-1 font-mono text-[10px] md:text-xs font-black text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-lg border border-primary/5 uppercase">
                                    <span>{timeLeft.d}d</span>
                                    <span className="opacity-30 pb-0.5">:</span>
                                    <span>{timeLeft.h.toString().padStart(2, '0')}h</span>
                                    <span className="opacity-30 pb-0.5">:</span>
                                    <span>{timeLeft.m.toString().padStart(2, '0')}m</span>
                                </div>
                            )}

                            <div className="bg-primary h-8 w-8 md:h-9 md:w-9 rounded-xl md:rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:bg-primary/90 group-hover:translate-x-0.5 transition-all shrink-0">
                                <ArrowRight className="h-4 w-4 md:h-4.5 md:w-4.5" />
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
};

export default WebinarFloatingButton;
