import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { 
  Play, Lock, Star, ChevronRight, Share2, 
  CheckCircle2, Video, FileText, MonitorPlay, Award, 
  Info, Loader2, Pin, CheckSquare, ListChecks, Clock as ClockIcon,
  ChevronDown, Send, UserCircle, Mail, Timer, CreditCard
} from "lucide-react";
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

interface Course {
  id: string;
  title: string;
  description: string;
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
  
  const [activeTab, setActiveTab] = useState("overview");
  
  // Enrollment Modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    user_name: "", user_email: "", whatsapp_number: "", profession: "", institute_name: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | ''>('');
  const [transactionId, setTransactionId] = useState("");
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  // Review state
  const [reviewData, setReviewData] = useState({ student_name: "", student_email: "", rating: 5, review_text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

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

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*, category:course_categories(name)")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      const cData = courseData as any;
      setCourse(cData);

      // Fetch assigned instructor - use instructor_id from course data
      const instrId = cData.instructor_id;
      console.log("Course instructor_id:", instrId);
      if (instrId) {
        try {
          const { data: instrData, error: instrError } = await (supabase.from("instructors" as any).select("*").eq("id", instrId).single() as any);
          console.log("Instructor data:", instrData, "Error:", instrError);
          if (instrData && !instrError) setInstructor(instrData as Instructor);
        } catch (instrErr) {
          console.error("Failed to fetch instructor:", instrErr);
        }
      } else {
        // Fallback: try to find instructor assigned to this course via assigned_courses array
        try {
          const { data: instrList } = await (supabase.from("instructors" as any).select("*").contains("assigned_courses", [courseId]) as any);
          if (instrList && instrList.length > 0) {
            setInstructor(instrList[0] as Instructor);
          }
        } catch (e) {
          console.error("Fallback instructor lookup failed:", e);
        }
      }

      // Fetch approved reviews
      const { data: reviewsData } = await (supabase.from("course_reviews" as any).select("*").eq("course_id", courseId).eq("is_approved", true).order("created_at", { ascending: false }) as any);
      setReviews((reviewsData || []) as CourseReview[]);

      // Fetch payment settings
      const { data: payData } = await (supabase.from("payment_settings").select("*").limit(1).single() as any);
      if (payData) setPaymentSettings(payData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (sectionsError) throw sectionsError;

      // Fetch content
      const { data: contentData, error: contentError } = await supabase
        .from("course_content")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (contentError) throw contentError;

      // Map content to sections
      const sectionsMap = new Map<string, CourseSection>();
      (sectionsData || []).forEach(section => {
        sectionsMap.set(section.id, { ...section, contents: [] });
      });

      const uncategorizedContent: CourseContent[] = [];
      (contentData || []).forEach(item => {
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

  const handleEnrollment = async () => {
    if (!enrollmentData.user_name || !enrollmentData.user_email || !enrollmentData.whatsapp_number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!course?.is_free) {
      if (!paymentMethod) {
        toast({ title: "Error", description: "Please select a payment method before submitting.", variant: "destructive" });
        return;
      }
      if (!transactionId || transactionId.trim() === "") {
        toast({ title: "Error", description: "Transaction ID is required to verify your payment. Your enrollment will not be processed without it.", variant: "destructive" });
        return;
      }
      if (timeLeft === 'Expired') {
        toast({ title: "Error", description: "Payment window has expired. Please reload to try again.", variant: "destructive" });
        return;
      }
    }

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_name: enrollmentData.user_name,
          user_email: enrollmentData.user_email,
          whatsapp_number: enrollmentData.whatsapp_number,
          profession: enrollmentData.profession,
          institute_name: enrollmentData.institute_name,
          payment_method: course?.is_free ? 'free' : paymentMethod,
          transaction_id: course?.is_free ? null : transactionId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });
      
      setShowEnrollmentModal(false);
      setPaymentMethod('');
      setPaymentDeadline(null);
      setTimeLeft('');
      setTransactionId('');
      setEnrollmentData({ 
        user_name: "", user_email: "", whatsapp_number: "", profession: "", institute_name: "" 
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Loading Course Details...</p>
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
      {/* Background Blur Elements (matches homepage) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>

      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column - 65% visually */}
          <div className="w-full lg:w-[65%]">
            
            {/* Breadcrumbs */}
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

            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-foreground mb-5 leading-tight lg:leading-[1.15] flex flex-wrap items-center gap-4">
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
            
            {/* Rating and Students */}
            <div className="flex items-center flex-wrap gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-100/50 dark:bg-yellow-500/10 px-2 py-0.5 rounded">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating || '4.8'}</span>
              </div>
              <span className="text-muted-foreground underline decoration-dotted underline-offset-4 cursor-help">{Math.floor((course.student_count || 0) * 0.82)} reviews</span>
              <span className="text-foreground font-medium">{course.student_count || 0} students</span>
            </div>
            
            {/* Short Description */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">
              Learn the core responsibilities and technical workflows. Master the intricacies of tools and processes for real-world application building. {course.description.substring(0, 100)}...
            </p>
            
            {/* Instructor & Date Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-border/50 py-5 mb-8 text-sm gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {instructor?.avatar_url ? (
                    <img 
                      src={instructor.avatar_url} 
                      alt={instructor.name} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Instructor</p>
                  <p className="font-semibold text-foreground">{instructor?.name || 'To be announced'}{instructor?.specialization ? `, ${instructor.specialization}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md">
                <Info className="w-4 h-4" />
                <span>Last updated {new Date(course.updated_at || Date.now()).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })}</span>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 border border-border bg-card rounded-lg p-1.5 mb-8 overflow-x-auto custom-scrollbar">
              {['overview', 'content', 'instructor', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[120px] py-2.5 text-sm font-semibold rounded-md capitalize transition-all ${activeTab === tab ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {tab === 'content' ? 'Course content' : tab}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm scale-in duration-500">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
                    📚 What you'll learn
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 gap-x-8">
                    {(course.learning_outcomes && course.learning_outcomes.length > 0) ? (
                      course.learning_outcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                            {outcome}
                          </span>
                        </div>
                      ))
                    ) : (
                      course.technologies?.map((tech, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                            Master {tech} concepts and build real-world applications independently.
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {course.requirements && course.requirements.length > 0 && (
                  <div className="px-2">
                    <h3 className="text-2xl font-bold mb-5">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      {course.requirements.map((req, idx) => (
                        <li key={idx} className="text-base sm:text-lg">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="px-2">
                   <h3 className="text-2xl font-bold mb-5">Description</h3>
                   <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                     {course.description}
                   </div>
                </div>

                {course.target_audience && course.target_audience.length > 0 && (
                  <div className="px-2">
                    <h3 className="text-2xl font-bold mb-5">Who this course is for:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      {course.target_audience.map((target, idx) => (
                        <li key={idx} className="text-base sm:text-lg">{target}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
               <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Course Content</h3>
                  <p className="text-sm text-muted-foreground">{sections.length} sections • {sections.reduce((acc, s) => acc + (s.contents?.length || 0), 0)} lectures</p>
                </div>
                        <div className="w-full relative pl-0 sm:pl-6 overflow-hidden">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[31px] sm:left-[39px] top-4 bottom-4 w-[2px] bg-primary/10 z-0 hidden sm:block"></div>
                    
                    <div className="space-y-6 relative z-10">
                    {sections.length > 0 ? (
                      sections.map((section, sIndex) => (
                        <div key={section.id} className="space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm border border-primary/20">
                                <Pin className="w-4 h-4 rotate-45" />
                             </div>
                             <div>
                               <h4 className="font-bold text-gray-900 dark:text-foreground text-base sm:text-lg leading-tight">
                                 {section.title}
                               </h4>
                               <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">
                                 Section {sIndex + 1} • {(() => { const mins = section.contents?.reduce((acc, c) => acc + (c.duration_minutes || 0), 0) || 0; const hrs = Math.floor(mins / 60); const rem = mins % 60; return hrs > 0 ? `${hrs}h ${rem > 0 ? `${rem}m` : ''}` : `${mins} min`; })()}
                               </p>
                             </div>
                          </div>

                          <div className="space-y-3">
                              <Accordion type="single" collapsible className="w-full space-y-3">
                                {section.contents?.map((item, cIndex) => (
                                  <AccordionItem key={item.id} value={item.id} className="bg-background border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group/item data-[state=open]:border-primary/20">
                                    <AccordionTrigger className="w-full hover:no-underline px-3.5 py-3.5 sm:px-4 sm:py-4 transition-all">
                                      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 text-left pr-2">
                                        <div className="hidden sm:flex relative items-center justify-center w-6 shrink-0">
                                           <div className="w-3 h-3 rounded-full border-2 border-primary bg-background z-10 group-hover/item:scale-110 transition-transform shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                                        </div>

                                        <div className="flex-1 select-none pr-4">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                              {item.content_type === 'video' ? <MonitorPlay className="w-4 h-4 text-primary shrink-0" /> : <FileText className="w-4 h-4 text-orange-500 shrink-0" />}
                                              <span className="line-clamp-1">{item.title}</span>
                                            </p>
                                          </div>
                                          <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 mt-1.5">
                                            {item.is_free && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Preview</span>}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                              <ClockIcon className="w-3.5 h-3.5" />
                                              {item.duration_minutes || 5} min
                                            </span>
                                            {(item.topics?.length || 0) > 0 && (
                                              <span className="text-xs text-primary/80 font-medium flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-full">
                                                <ListChecks className="w-3.5 h-3.5" />
                                                {item.topics!.length} topics
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 pl-4 shrink-0 mr-4">
                                          {item.is_free ? (
                                            <div className="relative w-8 h-8 flex items-center justify-center overflow-visible">
                                              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-40"></div>
                                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors group/play">
                                                <Play className="w-3.5 h-3.5 text-primary fill-current group-hover/play:scale-110 transition-transform" />
                                              </div>
                                            </div>
                                          ) : (
                                            <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    
                                    <AccordionContent className="px-4 sm:px-14 pb-4 pt-0 ml-0 sm:ml-4">
                                      <div className="space-y-3 border-l-2 border-primary/20 pl-6 py-2 mt-2 bg-muted/5 rounded-r-lg relative">
                                        {item.description && (
                                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                                        )}
                                        {item.topics && item.topics.length > 0 && (
                                          <div className="space-y-1 mt-3">
                                            {item.topics.map((topic, tIdx) => (
                                              <div key={tIdx} className="flex items-start gap-4 text-sm text-foreground/80 py-2 hover:text-foreground transition-colors group/topic">
                                                <CheckSquare className="w-4 h-4 text-green-500 shrink-0 mt-0.5 group-hover/topic:scale-110 transition-transform" />
                                                <span className="leading-relaxed font-medium">{topic}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {!item.description && (!item.topics || item.topics.length === 0) && (
                                          <div className="flex items-start gap-3 text-sm text-muted-foreground/60 py-2">
                                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">No additional details for this module.</span>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                        <MonitorPlay className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-foreground mb-1">No content available</h4>
                        <p className="text-muted-foreground">This course doesn't have any lessons posted yet.</p>
                      </div>
                    )}
                    </div>
                </div>
               </div>
            )}

            {activeTab === 'instructor' && (
              <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in duration-500">
                {instructor ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden shrink-0">
                        {instructor.avatar_url ? (
                          <img 
                            src={instructor.avatar_url} 
                            alt={instructor.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          instructor.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{instructor.name}</h3>
                        {instructor.specialization && <p className="text-sm text-primary font-medium">{instructor.specialization}</p>}
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" />{instructor.email}</p>
                      </div>
                    </div>
                    {instructor.bio && (
                      <div>
                        <h4 className="font-semibold mb-2">About</h4>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{instructor.bio}</p>
                      </div>
                    )}
                    {instructor.website && (
                      <a href={instructor.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                        Visit Website →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No instructor assigned yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Write a Review */}
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary" /> Write a Review</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Your Name *</Label>
                        <Input value={reviewData.student_name} onChange={(e) => setReviewData(p => ({...p, student_name: e.target.value}))} placeholder="Your name" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email *</Label>
                        <Input type="email" value={reviewData.student_email} onChange={(e) => setReviewData(p => ({...p, student_email: e.target.value}))} placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewData(p => ({...p, rating: star}))} className="focus:outline-none">
                            <Star className={`w-6 h-6 transition-colors ${star <= reviewData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Your Review</Label>
                      <Textarea value={reviewData.review_text} onChange={(e) => setReviewData(p => ({...p, review_text: e.target.value}))} placeholder="Share your experience with this course..." rows={3} />
                    </div>
                    <Button
                      onClick={async () => {
                        if (!reviewData.student_name || !reviewData.student_email) {
                          toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
                          return;
                        }
                        setSubmittingReview(true);
                        try {
                          const { error } = await (supabase.from("course_reviews" as any).insert({
                            course_id: courseId,
                            student_name: reviewData.student_name,
                            student_email: reviewData.student_email,
                            rating: reviewData.rating,
                            review_text: reviewData.review_text || null,
                          }) as any);
                          if (error) throw error;
                          toast({ title: "Review Submitted!", description: "Your review will appear after approval." });
                          setReviewData({ student_name: "", student_email: "", rating: 5, review_text: "" });
                        } catch (err: any) {
                          toast({ title: "Error", description: err.message || "Failed to submit review.", variant: "destructive" });
                        } finally {
                          setSubmittingReview(false);
                        }
                      }}
                      disabled={submittingReview}
                      className="w-full sm:w-auto"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>

                {/* Existing Reviews */}
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Student Reviews ({reviews.length})</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{review.student_name.charAt(0).toUpperCase()}</div>
                              <span className="font-semibold text-sm">{review.student_name}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/20'}`} />
                              ))}
                            </div>
                          </div>
                          {review.review_text && <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>}
                          <p className="text-xs text-muted-foreground/60 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No reviews yet. Be the first to share your experience!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Sidebar - 35% visually */}
          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-24 bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-blue-900/5 mb-8">
               
               {/* Preview Image/Video Area */}
               <div className="relative h-60 bg-muted flex items-center justify-center overflow-hidden group cursor-pointer border-b border-border/40">
                 {course.banner_image ? (
                   <img 
                     src={course.banner_image} 
                     alt={course.title} 
                     className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
                     loading="lazy"
                     decoding="async"
                   />
                 ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500"></div>
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all">
                       <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </div>
                    <span className="font-semibold tracking-wide text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">Preview Course</span>
                 </div>
               </div>

               <div className="p-7">
                 {/* Pricing */}
                 <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                       {course.is_free ? 'Free' : `৳${course.discounted_price || course.price}`}
                    </span>
                    {!course.is_free && course.discounted_price && (
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-lg text-muted-foreground line-through font-medium">
                          ৳{course.price}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-center leading-none">
                          {course.discount_percentage}% off!
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3 mb-6">
                    <Button 
                      size="lg" 
                      className="flex-1 bg-[#d91d79] hover:bg-[#b0145e] text-white font-bold text-base h-14 rounded-xl shadow-md transition-all active:scale-[0.98]"
                      onClick={() => setShowEnrollmentModal(true)}
                    >
                      Start course
                    </Button>
                    <Button 
                       size="lg" 
                       variant="outline" 
                       className="w-14 h-14 p-0 shrink-0 rounded-xl hover:bg-muted shadow-sm transition-colors"
                       onClick={handleShare}
                       title="Share this course"
                    >
                       <Share2 className="w-5 h-5 text-foreground" />
                    </Button>
                 </div>

                 <div className="text-center text-xs text-muted-foreground font-medium mb-8 pb-8 border-b border-border flex items-center justify-center gap-1.5 opacity-80">
                    <Info className="w-4 h-4" />
                    14 day money back guarantee
                 </div>

                 {/* Course Includes - Dynamic from admin */}
                 <div>
                    <h4 className="font-bold text-foreground text-base mb-5">This course includes:</h4>
                    <ul className="space-y-4">
                      {(course.course_includes && course.course_includes.length > 0) ? (
                        course.course_includes.map((item, idx) => {
                          const icons = [MonitorPlay, FileText, Video, Award, CheckCircle2];
                          const Icon = icons[idx % icons.length];
                          return (
                            <li key={idx} className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                              <Icon className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                              <span>{item}</span>
                            </li>
                          );
                        })
                      ) : (
                        <>
                          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                            <MonitorPlay className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                            <span>{course.duration_hours || 10} hours on-demand video</span>
                          </li>
                          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                            <FileText className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                            <span>{sections.reduce((acc, s) => acc + (s.contents?.length || 0), 0)} lectures</span>
                          </li>
                          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                            <Video className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                            <span>Full lifetime access</span>
                          </li>
                          <li className="flex items-start gap-4 text-sm text-foreground/80 font-medium">
                            <Award className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
                            <span>Certificate of completion</span>
                          </li>
                        </>
                      )}
                    </ul>
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollmentModal} onOpenChange={(open) => {
        setShowEnrollmentModal(open);
        if (!open) {
          setPaymentMethod('');
          setTransactionId('');
          setPaymentDeadline(null);
          setTimeLeft('');
        }
      }}>
        <DialogContent className="sm:max-w-md border-border/60 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Enroll in {course.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={enrollmentData.user_name}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_name: e.target.value }))}
                  placeholder="e.g., Salman Sakib"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={enrollmentData.user_email}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_email: e.target.value }))}
                  placeholder="e.g., your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-semibold">WhatsApp Number <span className="text-red-500">*</span></Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={enrollmentData.whatsapp_number}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+8801734567890"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profession" className="text-sm font-semibold">Profession</Label>
                <Input
                  id="profession"
                  value={enrollmentData.profession}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="institute" className="text-sm font-semibold">Institute / Company</Label>
                <Input
                  id="institute"
                  value={enrollmentData.institute_name}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, institute_name: e.target.value }))}
                  placeholder="e.g., University Name"
                />
              </div>
              {/* Payment Method Selector for Paid Courses */}
              {!course.is_free && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-semibold">Payment Method <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['bkash', 'nagad'] as const).map(method => (
                      <Button
                        key={method}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-12 text-sm font-semibold transition-all",
                          paymentMethod === method
                            ? method === 'bkash'
                              ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                              : "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                            : "hover:border-primary/40"
                        )}
                        onClick={() => {
                          setPaymentMethod(method);
                          if (!paymentDeadline) {
                            const windowMins = paymentSettings?.payment_window_minutes || 30;
                            setPaymentDeadline(addMinutes(new Date(), windowMins));
                          }
                        }}
                      >
                         <CreditCard className="h-4 w-4 mr-2" />
                        {method === 'bkash' ? 'bKash' : 'Nagad'}
                      </Button>
                    ))}
                  </div>

                  {paymentMethod && timeLeft !== 'Expired' && (
                    <div className={cn(
                      "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                      paymentMethod === 'bkash' ? "border-pink-400 bg-pink-50 dark:bg-pink-950/20" : "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                    )}>
                      <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg backdrop-blur-sm">
                         <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                            <Timer className="h-4 w-4" /> 
                            {timeLeft} left to pay
                         </div>
                         <h4 className="font-semibold text-foreground text-sm">
                           Fee: <span className="font-bold text-lg text-primary">৳{course.discounted_price || course.price}</span>
                         </h4>
                      </div>
                      
                      <p className="text-2xl font-mono font-bold text-foreground">
                        {paymentMethod === 'bkash' ? paymentSettings?.bkash_number : paymentSettings?.nagad_number}
                      </p>

                      {(paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code) && (
                        <div className="mx-auto w-44 h-44 bg-white p-2 rounded-xl shadow-sm my-4">
                          <img 
                            src={paymentMethod === 'bkash' ? paymentSettings?.bkash_qr_code : paymentSettings?.nagad_qr_code} 
                            alt={`${paymentMethod} QR Code`} 
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
                          value={transactionId}
                          onChange={e => setTransactionId(e.target.value)}
                          placeholder="e.g., 9F8G7H6A5B"
                          className="font-mono h-11 uppercase bg-background"
                        />
                      </div>
                    </div>
                  )}
                  
                  {timeLeft === 'Expired' && (
                    <div className="bg-destructive/10 rounded-lg p-4 text-center mt-4">
                      <p className="text-destructive font-semibold">Payment window expired.</p>
                      <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>Reload Page to Try Again</Button>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleEnrollment} 
                className="w-full bg-[#d91d79] hover:bg-[#b0145e] text-white font-bold tracking-wide h-12 mt-4" 
                disabled={
                  enrolling || 
                  timeLeft === 'Expired' ||
                  (!course.is_free && (!paymentMethod || !transactionId.trim())) || 
                  !enrollmentData.user_name || 
                  !enrollmentData.user_email || 
                  !enrollmentData.whatsapp_number
                }
              >
                {enrolling ? 'Processing...' : (course.is_free ? 'Confirm Free Enrollment' : 'Confirm Enrollment')}
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}