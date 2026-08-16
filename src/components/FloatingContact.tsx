import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const FloatingContact = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 200);
        };
        
        // Initial check
        handleScroll();
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const contactOptions = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-5 h-5" />,
            color: 'bg-brand-whatsapp',
            hoverColor: 'hover:bg-brand-whatsapp-hover',
            link: "https://wa.me/8801682359817?text=Hello%20Salman,%20I'm%20interested%20in%20your%20services.",
            delay: 0.1
        },
        {
            name: 'Telegram',
            icon: <Send className="w-5 h-5" />,
            color: 'bg-brand-telegram',
            hoverColor: 'hover:bg-brand-telegram-hover',
            link: "https://t.me/+8801682359817",
            delay: 0
        }
    ];

    const isExcludedPage = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/career-prep/solve/');

    if (isExcludedPage) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                    className="flex flex-col gap-3 mb-2"
                                >
                                    {contactOptions.map((opt) => (
                                        <motion.a
                                            key={opt.name}
                                            href={opt.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: opt.delay }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-xl min-w-[160px] font-bold text-sm backdrop-blur-md transition-all border border-white/10",
                                                opt.color,
                                                opt.hoverColor
                                            )}
                                        >
                                            <div className="bg-white/20 p-1.5 rounded-lg">
                                                {opt.icon}
                                            </div>
                                            {opt.name}
                                        </motion.a>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl relative group overflow-hidden transition-all duration-500",
                                isOpen ? "bg-destructive rotate-90" : "bg-primary"
                            )}
                        >
                            {/* Animated Background Pulse */}
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-full h-full rounded-3xl bg-primary animate-ping opacity-20" />
                                </div>
                            )}
                            
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                    >
                                        <X className="w-7 h-7" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="open"
                                        initial={{ opacity: 0, rotate: 90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: -90 }}
                                        className="relative"
                                    >
                                        <MessageSquare className="w-7 h-7" />
                                        {/* Notification badge */}
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive border-2 border-primary rounded-full" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingContact;
