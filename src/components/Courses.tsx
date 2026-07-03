import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Clock, Zap, ChevronRight, ArrowRight, Layout, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CourseCountdown } from "@/components/CourseCountdown";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";

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
  original_price: number | null;
  status: string;
  start_date?: string;
}

export default function Courses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedCourses: Course[] = (data || []).map((rawCourse: any) => ({
        ...rawCourse,
        banner_image: rawCourse.banner_image || null,
        technologies: Array.isArray(rawCourse.technologies) ? rawCourse.technologies : [],
        duration_hours: rawCourse.duration_hours ?? null,
        difficulty_level: rawCourse.difficulty_level || 'beginner',
        discount_percentage: rawCourse.discount_percentage ?? null,
        discounted_price: rawCourse.discounted_price ?? null,
        original_price: rawCourse.original_price ?? rawCourse.price,
        status: rawCourse.status || 'published'
      }));

      setCourses(transformedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({ title: "Error", description: "Failed to load courses.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Loading Courses...</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Professional Courses
            </h2>
            <p className="text-lg md:text-xl text-primary font-semibold max-w-2xl mx-auto">
              Master the latest technologies with our comprehensive courses designed for real-world success
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course, index) => (
            <ScrollReveal key={course.id} direction="up" delay={index * 0.1}>
              <div className="bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50">

                {/* Header Section */}
                <div className="relative bg-primary text-primary-foreground p-8 pb-10 flex flex-col items-center justify-center text-center overflow-hidden h-[200px] shrink-0">
                  {/* Decorative shapes */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-8 translate-y-8"></div>

                  {/* Title */}
                  <h3 className="font-bold text-2xl z-10 uppercase tracking-wide leading-tight px-4 flex items-center justify-center gap-2">
                    {course.title}
                  </h3>

                  {/* Registration Pill */}
                  <div className="mt-4 z-10 bg-black/20 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider border border-white/10 shadow-sm">
                    REGISTRATION NOW
                  </div>

                  {/* Limited Seat available text */}
                  <div className="mt-2 text-[9px] z-10 text-primary-foreground/70 uppercase tracking-widest font-medium">Limited seat available</div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-grow gap-5">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-lg text-foreground leading-snug flex items-center gap-2">
                       {course.title}
                       {course.is_free && (
                         <span className="bg-danger text-danger-foreground text-[9px] h-4 px-1.5 rounded-full flex items-center gap-1 font-black animate-pulse shrink-0">
                           <span className="relative flex h-1 w-1">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                           </span>
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
                      <div className="bg-success-soft text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-success/20">
                        {course.difficulty_level || "beginner"}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-grow">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {course.technologies.slice(0, 3).map(tech => (
                      <Badge key={tech} variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-muted text-muted-foreground border border-border/50">
                        {tech}
                      </Badge>
                    ))}
                    {course.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-muted text-muted-foreground border border-border/50">
                        +{course.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border/10">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{course.duration_hours ? `${course.duration_hours}h` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      {(course.is_free || (!course.price && !course.discounted_price)) ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success text-success-foreground text-xs font-bold tracking-wide shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
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
                    className={cn(
                      "w-full rounded-xl mt-1 h-12 font-black shadow-md transition-all active:scale-[0.98] group flex items-center justify-center gap-2",
                      course.is_free
                        ? "bg-success hover:bg-success/90 text-success-foreground"
                        : "bg-primary hover:bg-primary-hover text-primary-foreground"
                    )}
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {course.is_free ? (
                      <>
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                        Join for Free
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">Check back soon for new courses!</p>
          </div>
        )}
      </div>
    </section>
  );
}
