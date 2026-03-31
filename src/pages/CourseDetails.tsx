import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Lock, Star, ChevronRight, Share2, 
  CheckCircle2, Video, FileText, MonitorPlay, Award, 
  Info, Loader2, Pin, CheckSquare, ListChecks, Clock as ClockIcon,
  ChevronDown, Send, UserCircle, Mail, Timer, CreditCard,
  GraduationCap, Rocket, BookOpen, Layout, Linkedin,
  HelpCircle, Quote, ArrowRight, Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Textarea } from "@/components/ui/textarea";
import { addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import PaymentModal, { PaymentModalData } from "@/components/PaymentModal";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  banner_image?: string;
  price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  is_free: boolean;
  difficulty_level?: string;
  duration_hours?: number;
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  technologies: string[];
  category?: { name: string } | null;
  category_id?: string | null;
  rating?: number;
  student_count?: number;
  sections?: CourseSection[];
  start_date?: string;
  updated_at?: string;
  faqs?: { question: string; answer: string }[];
  course_includes?: string[];
  instructor_id?: string | null;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  specialization?: string;
  avatar_url?: string;
  website?: string;
  linkedin_url?: string;
}

interface CourseReview {
  id: string;
  student_name: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  contents?: CourseContent[];
}

interface CourseContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  content_data: any;
  is_free: boolean;
  duration_minutes?: number;
  topics?: string[];
  order_index: number;
}

export default function CourseDetails() {
  const { courseId } = useParams();
  usePageView(`/course/${courseId}`);
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Enrollment Modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Review state
  const [reviewData, setReviewData] = useState({ student_name: "", student_email: "", rating: 5, review_text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      // 1. Fetch primary course data first (essential for other queries)
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*, category:course_categories(name)")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      const cData = courseData as any;
      setCourse(cData);

      // 2. Parallelize all independent secondary metadata queries
      const [
        instructorResult,
        reviewsResult,
        paymentResult,
        sectionsResult,
        contentResult,
        relatedResult
      ] = await Promise.all([
        // Instructor fetch
        (async () => {
          const instrId = cData.instructor_id;
          if (instrId) {
            const { data } = await (supabase.from("instructors" as any).select("*").eq("id", instrId).single() as any);
            return data;
          } else {
            const { data } = await (supabase.from("instructors" as any).select("*").contains("assigned_courses", [courseId]) as any);
            return data && data.length > 0 ? data[0] : null;
          }
        })(),
        // Reviews fetch
        supabase.from("course_reviews" as any).select("*").eq("course_id", courseId).eq("is_approved", true).order("created_at", { ascending: false }),
        // Payment settings fetch
        supabase.from("payment_settings").select("*").limit(1).single(),
        // Sections fetch
        supabase.from("course_sections").select("*").eq("course_id", courseId).order("order_index"),
        // Content fetch
        supabase.from("course_content").select("*").eq("course_id", courseId).order("order_index"),
        // Related courses fetch
        (async () => {
           // We fire these in parallel internally too
           const [catRelated, tagRelated] = await Promise.all([
             (supabase.from("courses") as any).select("*").eq("category_id", cData.category_id).neq("id", courseId).limit(6),
             (supabase.from("courses") as any).select("*").overlaps("technologies", cData.technologies || []).neq("id", courseId).limit(6)
           ]);
           
           let unique = Array.from(new Map([...(catRelated.data || []), ...(tagRelated.data || [])].map(c => [c.id, c])).values())
            .filter(c => c.id !== courseId)
            .slice(0, 3);
            
           if (unique.length === 0) {
             const { data } = await (supabase.from("courses") as any).select("*").neq("id", courseId).limit(3);
             unique = (data || []) as Course[];
           }
           return unique;
        })()
      ]);

      // 3. Batch state updates (React 18 handles this automatically, but logic is cleaner now)
      if (instructorResult) setInstructor(instructorResult as Instructor);
      setReviews((reviewsResult.data as any || []) as CourseReview[]);
      if (paymentResult.data) setPaymentSettings(paymentResult.data);
      setRelatedCourses(relatedResult as Course[]);

      // Process sections and content
      const sectionsData = sectionsResult.data || [];
      const contentData = contentResult.data || [];
      
      const sectionsMap = new Map<string, CourseSection>();
      sectionsData.forEach(section => {
        sectionsMap.set(section.id, { ...section, contents: [] });
      });

      const uncategorizedContent: CourseContent[] = [];
      contentData.forEach(item => {
        if (item.section_id && sectionsMap.has(item.section_id)) {
          sectionsMap.get(item.section_id)!.contents!.push(item);
        } else {
          uncategorizedContent.push(item);
        }
      });

      const organizedSections = Array.from(sectionsMap.values());
      if (uncategorizedContent.length > 0) {
        organizedSections.push({
          id: "uncategorized",
          title: organizedSections.length > 0 ? "Additional Materials" : "Course Modules",
          order_index: 999,
          contents: uncategorizedContent
        });
      }
      setSections(organizedSections);

    } catch (error) {
      console.error("Error fetching course details:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'video':
        return <MonitorPlay className="w-4 h-4 text-primary shrink-0" />;
      case 'lecture':
        return <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'quiz':
        return <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'assignment':
        return <Award className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'project':
        return <Rocket className="w-4 h-4 text-pink-500 shrink-0" />;
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'text':
        return <FileText className="w-4 h-4 text-orange-500 shrink-0" />;
      default:
        return <Layout className="w-4 h-4 text-muted-foreground shrink-0" />;
    }
  };

  const handleEnrollment = async (data: PaymentModalData) => {
    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_name: data.name,
          user_email: data.email,
          whatsapp_number: data.whatsapp,
          profession: data.extras.profession,
          institute_name: data.extras.institute_name,
          payment_method: course?.is_free ? 'free' : data.paymentMethod,
          transaction_id: course?.is_free ? null : data.transactionId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });
      
      // Modal success state is handled internally by PaymentModal
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error; // Rethrow so PaymentModal shows error
    } finally {
      setEnrolling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title,
          text: `Check out this course: ${course?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Course link copied to clipboard." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-[65%]">
              <Skeleton className="h-4 w-32 mb-6" />
              <Skeleton className="h-10 w-full mb-6" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-24 w-full mb-10" />
              <div className="flex gap-4 border-y py-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                   <Skeleton className="h-4 w-32 mb-2" />
                   <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="w-full lg:w-[35%]">
              <div className="sticky top-24 border rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-video w-full" />
                <div className="p-7 space-y-6">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-14 w-full" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-medium text-destructive">Course not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30 pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>

      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <div className="w-full lg:w-[65%]">
            <div className="flex items-center flex-wrap text-sm text-muted-foreground mb-6 gap-2">
              <Link to="/courses" className="hover:text-primary transition-colors font-medium">All courses</Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="text-foreground font-semibold">{course.title}</span>
              <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0 flex gap-2">
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 pointer-events-none capitalize">
                  {course.difficulty_level || 'beginner'}
                </Badge>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-foreground mb-5 leading-tight flex flex-wrap items-center gap-4">
              {course.title}
              {course.is_free && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 flex items-center gap-2 text-sm font-bold border-none shadow-md animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </div>
                  FREE
                </Badge>
              )}
            </h1>
            
            <div className="flex items-center flex-wrap gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-100/50 dark:bg-yellow-500/10 px-2 py-0.5 rounded">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating || '4.8'}</span>
              </div>
              <span className="text-muted-foreground underline decoration-dotted underline-offset-4 cursor-help">{Math.floor((course.student_count || 0) * 0.82)} reviews</span>
              <span className="text-foreground font-medium">{course.student_count || 0} students</span>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              {course.short_description || `${course.description.substring(0, 160)}...`}
            </p>
            
            {/* Instructor & Date Info - Sleek One-liner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-border/50 py-4 mb-8 text-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 border border-border/50 shadow-sm">
                  {instructor?.avatar_url ? (
                    <img src={instructor.avatar_url} alt={instructor.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-7 h-7" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                  <div>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Instructor</p>
                    <p className="font-bold text-foreground flex items-center gap-2 leading-none">
                      {instructor?.name || 'To be announced'}
                      {instructor?.specialization && <span className="text-muted-foreground font-medium text-xs">• {instructor.specialization}</span>}
                    </p>
                  </div>
                  {instructor?.linkedin_url && (
                    <a 
                      href={instructor.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-[11px] font-black text-[#0077b5] hover:text-white hover:bg-[#0077b5] bg-[#0077b5]/5 px-3 py-1 rounded-full border border-[#0077b5]/10 transition-all"
                    >
                      <Linkedin className="w-3 h-3" /> 
                      <span>VIEW PROFILE</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/60 bg-muted/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-border/30">
                <Info className="w-3 h-3" />
                <span>Last updated {new Date(course.updated_at || Date.now()).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="flex space-x-1 border border-border/50 bg-muted/30 rounded-xl p-1 mb-8 overflow-x-auto no-scrollbar relative min-h-[48px]">
              {['overview', 'content', 'reviews', 'faq'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 min-w-[100px] h-full py-2.5 text-xs sm:text-sm font-bold capitalize transition-all"
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-border/20"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 block ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab === 'content' ? 'Course content' : tab === 'faq' ? 'FAQ' : tab}
                  </span>
                </button>
              ))}
            </div>
            
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid gap-4">
                  {(course.faqs && course.faqs.length > 0 ? course.faqs : [
                    { question: "How long will I have access?", answer: "Once enrolled, you get lifetime access to all course materials including future updates." },
                    { question: "Do I get a certificate?", answer: "Yes, you'll receive a verified digital certificate upon successfully completing all modules." },
                    { question: "Is there any support?", answer: "Absolutely! You'll get access to our private community where mentors and peers help each other." },
                    { question: "Are there prerequisites?", answer: "Basic computer literacy and a passion for learning are all you need!" },
                    { question: "Access on mobile?", answer: "Yes! Our platform is fully responsive. You can learn on any device anytime." }
                  ]).map((faq: any, i: number) => (
                    <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm group hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                          <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold mb-2 group-hover:text-primary transition-colors">{faq.question || faq.q}</h4>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.answer || faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm scale-in duration-500">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">📚 What you'll learn</h3>
                  <div className="grid sm:grid-cols-2 gap-4 gap-x-8">
                    {(course.learning_outcomes && course.learning_outcomes.length > 0) ? (
                      course.learning_outcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{outcome}</span>
                        </div>
                      ))
                    ) : (
                      course.technologies?.map((tech, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">Master {tech} concepts and build projects.</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {course.requirements && course.requirements.length > 0 && (
                  <div className="px-2">
                    <h3 className="text-2xl font-bold mb-5">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      {course.requirements.map((req, idx) => (<li key={idx} className="text-base sm:text-lg">{req}</li>))}
                    </ul>
                  </div>
                )}
                <div className="px-2">
                   <h3 className="text-2xl font-bold mb-5">Description</h3>
                   <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base sm:text-lg">{course.description}</div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
               <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Course Content</h3>
                  <p className="text-sm text-muted-foreground">{sections.length} sections • {sections.reduce((acc, s) => acc + (s.contents?.length || 0), 0)} lectures</p>
                </div>
                <div className="w-full relative pl-0 sm:pl-6 overflow-hidden">
                  <div className="absolute left-[31px] sm:left-[39px] top-4 bottom-4 w-[2px] bg-primary/10 z-0 hidden sm:block"></div>
                  <div className="space-y-6 relative z-10">
                    {sections.length > 0 ? (
                      sections.map((section, sIndex) => (
                        <div key={section.id} className="space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/20"><Pin className="w-4 h-4 rotate-45" /></div>
                             <div>
                               <h4 className="font-bold text-gray-900 dark:text-foreground text-base sm:text-lg leading-tight">{section.title}</h4>
                               <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">Section {sIndex + 1}</p>
                             </div>
                          </div>
                          <Accordion type="single" collapsible className="w-full space-y-3">
                            {section.contents?.map((item) => (
                              <AccordionItem key={item.id} value={item.id} className="bg-background border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group/item">
                                <AccordionTrigger className="w-full hover:no-underline px-4 py-4">
                                  <div className="flex items-center gap-4 flex-1 text-left pr-2">
                                    <div className="hidden sm:flex relative items-center justify-center w-6 shrink-0"><div className="w-3 h-3 rounded-full border-2 border-primary bg-background z-10" /></div>
                                    <div className="flex-1 select-none pr-4">
                                      <p className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                        {getIconForType(item.content_type)} <span className="line-clamp-1">{item.title}</span>
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 pl-4 shrink-0 mr-4">
                                      {item.is_free ? <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-primary fill-current" /></div> : <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 sm:px-14 pb-4 pt-0">
                                  <div className="space-y-3 border-l-2 border-primary/20 pl-6 py-2 mt-2 bg-muted/5 rounded-r-lg relative">
                                    {item.description && <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))
                    ) : (<div className="text-center py-12">No content available.</div>)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary" /> Write a Review</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input value={reviewData.student_name} onChange={(e) => setReviewData(p => ({...p, student_name: e.target.value}))} placeholder="Your name" />
                      <Input type="email" value={reviewData.student_email} onChange={(e) => setReviewData(p => ({...p, student_email: e.target.value}))} placeholder="Email" />
                    </div>
                    <Textarea value={reviewData.review_text} onChange={(e) => setReviewData(p => ({...p, review_text: e.target.value}))} placeholder="Share your experience..." rows={3} />
                    <Button onClick={async () => {
                      if (!reviewData.student_name || !reviewData.student_email) { toast({ title: "Error", description: "Required fields missing", variant: "destructive" }); return; }
                      setSubmittingReview(true);
                      try {
                        const { error } = await (supabase.from("course_reviews" as any).insert({ course_id: courseId, student_name: reviewData.student_name, student_email: reviewData.student_email, rating: reviewData.rating, review_text: reviewData.review_text }) as any);
                        if (error) throw error;
                        toast({ title: "Submitted!" });
                        setReviewData({ student_name: "", student_email: "", rating: 5, review_text: "" });
                      } catch (err: any) { toast({ title: "Error", variant: "destructive" }); } finally { setSubmittingReview(false); }
                    }} disabled={submittingReview}>Submit Review</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-24 bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-xl mb-8">
               <div className="relative h-60 bg-muted flex items-center justify-center overflow-hidden group cursor-pointer">
                 {course.banner_image ? <img src={course.banner_image} alt={course.title} className="w-full h-full object-cover" decoding="async" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500" />}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white"><Play className="w-16 h-16 fill-white opacity-60 group-hover:opacity-100 transition-all" /></div>
               </div>
               <div className="p-7">
                 <div className="flex items-end gap-3 mb-6"><span className="text-4xl font-extrabold">৳{course.discounted_price || course.price}</span></div>
                 <div className="flex gap-3 mb-6">
                    <Button size="lg" className="flex-1 bg-[#d91d79] hover:bg-[#b0145e] h-14 rounded-xl text-white font-bold" onClick={() => setShowEnrollmentModal(true)}>Start course</Button>
                    <Button size="lg" variant="outline" className="w-14 h-14 p-0 rounded-xl" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
                 </div>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-4 text-sm font-medium"><MonitorPlay className="w-5 h-5 shrink-0" /> Full lifetime access</li>
                    <li className="flex items-start gap-4 text-sm font-medium"><Award className="w-5 h-5 shrink-0" /> Certificate of completion</li>
                 </ul>
                </div>
             </div>

             {relatedCourses.length > 0 && (
               <div className="mt-10 space-y-5">
                 <h3 className="text-xl md:text-2xl font-black text-foreground/90 px-1 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                   You can also find useful
                 </h3>
                 <div className="flex flex-col gap-4">
                   {relatedCourses.map((rc) => (
                     <div key={rc.id} className="bg-background/40 backdrop-blur-sm border border-border/40 rounded-2xl p-4 shadow-sm group hover:border-primary/40 hover:shadow-md transition-all flex gap-5">
                       <Link to={`/course/${rc.id}`} className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted group-hover:scale-95 transition-transform duration-500">
                         {rc.banner_image ? <img src={rc.banner_image} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Layout className="w-6 h-6 text-primary/40" /></div>}
                       </Link>
                       <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <div className="mb-2">
                           <Link to={`/course/${rc.id}`} className="block font-bold text-sm leading-[1.3] text-foreground hover:text-primary transition-colors line-clamp-2">{rc.title}</Link>
                         </div>
                         <div className="flex items-center justify-between gap-2 mt-auto">
                           <div className="flex flex-col">
                             {rc.discounted_price ? (
                               <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-primary">৳{rc.discounted_price}</span>
                                 <span className="text-[10px] text-muted-foreground line-through opacity-60">৳{rc.price}</span>
                               </div>
                             ) : (
                               <span className="text-sm font-black text-primary">{rc.is_free ? 'FREE' : `৳${rc.price}`}</span>
                             )}
                           </div>
                           <Link 
                             to={`/course/${rc.id}`} 
                             className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-[#d91d79] hover:text-[#b0145e] transition-colors"
                           >
                             Enroll Now <ChevronRight className="w-3 h-3 ml-0.5" />
                           </Link>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        </div>

        <PaymentModal
          open={showEnrollmentModal}
          onOpenChange={setShowEnrollmentModal}
          title={`Enroll in ${course.title}`}
          isFree={course.is_free}
          priceLabel={course.price ? `৳${course.discounted_price || course.price}` : undefined}
          onSubmit={handleEnrollment}
          extraFields={[
            { key: 'profession', label: 'Profession', placeholder: 'e.g. Student, Engineer', required: true },
            { key: 'institute_name', label: 'Institute/Organization', placeholder: 'e.g. University/Company', required: true }
          ]}
          submitLabel="Confirm Enrollment"
        />
      </div>
    </div>
  );
}