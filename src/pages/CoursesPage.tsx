import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import LottieAnimation from "@/components/LottieAnimation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Clock, ChevronRight, GraduationCap, Calendar, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CourseCountdown } from "@/components/CourseCountdown";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  banner_image: string | null;
  technologies: string[];
  price: number;
  is_free: boolean;
  duration_hours: number | null;
  difficulty_level: string;
  discount_percentage: number | null;
  discounted_price: number | null;
  category_id: string | null;
  start_date?: string;
  course_type?: string;
}

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  webinar_date: string;
  banner_url: string | null;
  is_free: boolean | null;
  price: number | null;
  status: string | null;
  booked_count: number | null;
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, courseRes, webinarRes] = await Promise.all([
        supabase.from("course_categories" as any).select("*").order("name"),
        supabase.from("courses").select("*").eq("status", "published").order("created_at", { ascending: false }),
        supabase.from("webinars").select("*").in("status", ["published", "upcoming"]).order("webinar_date", { ascending: true }),
      ]);

      setCategories((catRes.data as any[]) || []);
      if (courseRes.error) throw courseRes.error;
      setCourses((courseRes.data as any[]) || []);
      setWebinars((webinarRes.data as Webinar[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTag = true;
    if (selectedTag === "all") matchesTag = true;
    else if (selectedTag === "free") matchesTag = course.is_free;
    else if (selectedTag === "webinar") matchesTag = course.course_type === 'webinar';
    else matchesTag = course.category_id === selectedTag || course.course_type?.toLowerCase() === selectedTag.toLowerCase();
    
    return matchesSearch && matchesTag;
  });

  const filteredWebinars = webinars.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (w.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTag = true;
    if (selectedTag === "all") matchesTag = true;
    else if (selectedTag === "free") matchesTag = w.is_free === true;
    else if (selectedTag === "webinar") matchesTag = true;
    else matchesTag = false; // Webinars don't have categories in this simple model
    
    return matchesSearch && matchesTag;
  });

  const rootCategories = categories.filter(c => !c.parent_id);
  const customTypes = Array.from(new Set(courses.map(c => c.course_type).filter(Boolean))) as string[];
  const existingCategoryNames = new Set(categories.map(c => c.name.toLowerCase().trim()));
  
  const additionalTags = customTypes.filter(t => {
    const normalized = t.toLowerCase().trim();
    return !existingCategoryNames.has(normalized) && 
           !['regular', 'free courses', 'free course', 'webinar', 'all'].includes(normalized);
  });

  const categoryTags = rootCategories.filter(cat => {
    const normalized = cat.name.toLowerCase().trim();
    return !['free courses', 'free course', 'webinar'].includes(normalized);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-3xl">
              <div className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
                Explore Our Catalog
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                <span className="text-accent">Master New Skills</span>
                <br />
                <span className="text-foreground">with Professional Courses</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Unlock your potential with our expert-led courses designed to take you from beginner to professional in weeks.
              </p>

              <div className="relative max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  className="w-full h-14 pl-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-full focus:bg-background transition-all text-lg"
                  placeholder="Search for courses, webinars, or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <LottieAnimation
                src="/animations/students-learning.json"
                className="w-full max-w-md aspect-square"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          
          <div className="flex-1">
            <div className="mb-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedTag === 'all' ? 'All Courses' : 
                   selectedTag === 'free' ? 'Free Courses' :
                   selectedTag === 'webinar' ? 'Latest Webinars' :
                   categories.find(c => c.id === selectedTag)?.name || 'Filtered Results'}
                  <span className="ml-3 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {filteredCourses.length + filteredWebinars.length}
                  </span>
                </h2>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-1 px-1">
                <button
                  onClick={() => setSelectedTag("all")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                    selectedTag === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                      : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                  )}
                >
                  All Courses
                </button>
                {categoryTags.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedTag(cat.id)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                      selectedTag === cat.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                        : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
                {additionalTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                      selectedTag === tag 
                        ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                        : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTag("free")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                    selectedTag === "free"
                      ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                      : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                  )}
                >
                  Free Courses
                </button>
                <button
                  onClick={() => setSelectedTag("webinar")}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                    selectedTag === "webinar"
                      ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                      : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                  )}
                >
                  Webinar
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[450px] bg-card border rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (filteredWebinars.length > 0 || filteredCourses.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Webinar cards first */}
                {filteredWebinars.map((webinar, index) => (
                  <ScrollReveal key={`w-${webinar.id}`} direction="up" delay={index * 0.05}>
                    <div
                      className="bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50 group cursor-pointer"
                      onClick={() => navigate(`/webinar/${webinar.id}`)}
                    >
                      <div className="relative bg-series-webinar text-white p-8 pb-10 flex flex-col items-center justify-center text-center overflow-hidden h-[200px] shrink-0">

                        {webinar.banner_url && (
                          <img src={webinar.banner_url} alt={webinar.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                        )}
                        
                        <div className="z-10 flex items-center gap-2 mb-3">
                          <Video className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Webinar</span>
                        </div>
                        
                        <h3 className="font-bold text-xl z-10 leading-tight px-4">
                          {webinar.title}
                        </h3>
                        
                        <div className="mt-3 z-10 flex items-center gap-2 text-xs opacity-90">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(webinar.webinar_date), "MMM dd, yyyy • hh:mm a")}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow gap-4">
                        {new Date(webinar.webinar_date) > new Date() && (
                          <div className="bg-warning-soft text-warning text-[11px] font-bold px-3 py-1.5 rounded-full w-fit">
                            <CourseCountdown startDate={webinar.webinar_date} showIcon={false} />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow">
                          {webinar.description || "Join this exciting webinar to learn from industry experts."}
                        </p>

                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/10">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-medium">{webinar.booked_count || 0} registered</span>
                          </div>
                          <div className="font-bold text-foreground">
                            {webinar.is_free ? (
                              <span className="text-success font-black tracking-tight">FREE</span>
                            ) : (
                              <span>৳ {webinar.price}</span>
                            )}
                          </div>
                        </div>

                        <Badge className={cn(
                          "w-fit text-[10px] font-bold uppercase tracking-wider",
                          webinar.status === 'published'
                            ? "bg-success-soft text-success"
                            : "bg-warning-soft text-warning"
                        )}>
                          {webinar.status === 'published' ? 'Live' : 'Upcoming'}
                        </Badge>

                        <Button
                          className="w-full mt-1 h-12 active:scale-[0.98]"
                          onClick={(e) => { e.stopPropagation(); navigate(`/webinar/${webinar.id}`); }}
                        >
                          Register Now
                        </Button>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}

                {/* Course cards after */}
                {filteredCourses.map((course, index) => (
                  <ScrollReveal key={course.id} direction="up" delay={(filteredWebinars.length + index) * 0.05}>
                    <div
                      className="bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50 group cursor-pointer"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <div className="relative bg-primary text-white p-8 pb-10 flex flex-col items-center justify-center text-center overflow-hidden h-[200px] shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-8 translate-y-8"></div>

                        <h3 className="font-bold text-2xl z-10 uppercase tracking-wide leading-tight px-4 flex items-center justify-center gap-2">
                          {course.title}
                        </h3>

                        <div className="mt-4 z-10 bg-black/20 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider border border-white/10 shadow-sm">
                          REGISTRATION NOW
                        </div>

                        <div className="mt-2 text-[9px] z-10 text-primary-foreground/70 uppercase tracking-widest font-medium">Limited seat available</div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow gap-5">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-lg text-foreground leading-snug flex items-center gap-2">
                             {course.title}
                             {course.is_free && (
                               <span className="bg-danger text-danger-foreground text-[9px] h-4 px-1.5 rounded-full flex items-center gap-1 font-black animate-pulse shrink-0">
                                 FREE
                               </span>
                             )}
                          </h4>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {course.start_date && (
                              <div className="bg-warning-soft text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CourseCountdown startDate={course.start_date} showIcon={false} />
                              </div>
                            )}
                            <div className="bg-success-soft text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                              {course.difficulty_level || "beginner"}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {course.technologies?.slice(0, 3).map(tech => (
                            <Badge key={tech} variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-muted text-muted-foreground border border-border/50">
                              {tech}
                            </Badge>
                          ))}
                          {course.technologies?.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-muted text-muted-foreground border border-border/50">
                              +{course.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/10">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">{course.duration_hours ? `${course.duration_hours}h` : 'Self-paced'}</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-foreground">
                            {(course.is_free || (!course.price && !course.discounted_price)) ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success text-success-foreground text-xs font-bold tracking-wide shadow-sm">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                FREE
                              </span>
                            ) : course.discounted_price ? (
                              <>
                                <span>৳ {course.discounted_price}</span>
                                <span className="text-xs text-muted-foreground line-through font-normal">৳ {course.price}</span>
                              </>
                            ) : (
                              <span>৳ {course.price}</span>
                            )}
                          </div>
                        </div>

                        <Button
                          className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl mt-1 h-12 font-semibold shadow-md transition-all active:scale-[0.98]"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          View Course Details
                        </Button>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search or category filters to find what you're looking for.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-xl"
                  onClick={() => {setSearchQuery(""); setSelectedTag("all")}}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
