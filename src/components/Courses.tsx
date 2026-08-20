import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Clock, Zap, ChevronRight, ArrowRight, Layout, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CourseCountdown } from "@/components/CourseCountdown";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CardGridSkeleton } from '@/components/ui/skeletons';
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
    // Skeleton, not "Loading Courses…": the heading stays put, the cards reserve
    // their space, and nothing below jumps when the data lands.
    return (
      <section id="courses" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Professional Courses</h2>
          </div>
          <div className="mx-auto max-w-6xl">
            <CardGridSkeleton count={3} />
          </div>
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

        {/* A carousel rather than a vertical grid: the course list grows, and a
            grid pushes everything below it — including the sections that convert —
            further down the page with every course added. Same pattern as
            Testimonials and the blog strip. */}
        <div className="max-w-6xl mx-auto">
          <Carousel opts={{ align: 'start', loop: courses.length > 3 }} className="w-full">
            <CarouselContent className="-ml-4 py-2">
          {courses.map((course, index) => (
            <CarouselItem key={course.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 flex">
            <ScrollReveal direction="up" delay={index * 0.1} className="flex h-full w-full">
              <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">

                {/* Header Section */}
                <div className="relative flex h-[168px] shrink-0 flex-col items-center justify-center overflow-hidden bg-primary px-4 py-5 text-center text-primary-foreground sm:h-[184px]">
                  {/* Title */}
                  <h3 className="z-10 line-clamp-3 px-2 text-base font-bold uppercase leading-tight tracking-wide sm:text-lg lg:text-xl [overflow-wrap:anywhere]">
                    {course.title}
                  </h3>

                  {/* Registration Pill */}
                  <div className="mt-3 z-10 bg-scrim/20 text-accent-foreground text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider border border-accent-foreground/10 shadow-sm">
                    REGISTRATION NOW
                  </div>

                  {/* Limited Seat available text */}
                  <div className="mt-2 text-[9px] z-10 text-primary-foreground/70 uppercase tracking-widest font-medium">Limited seat available</div>
                </div>

                {/* Body Content */}
                <div className="flex flex-grow flex-col gap-4 p-5">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="line-clamp-2 flex min-h-[3.25rem] items-start gap-2 text-base font-bold leading-snug text-foreground sm:text-lg">
                       {course.title}
                       {course.is_free && (
                         <span className="bg-danger text-danger-foreground text-[9px] h-4 px-1.5 rounded-full flex items-center gap-1 font-black animate-pulse shrink-0">
                           <span className="relative flex h-1 w-1">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-1 w-1 bg-accent-foreground"></span>
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
                      <div className="bg-success-soft text-success-strong text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-success/20">
                        {course.difficulty_level || "beginner"}
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-3 min-h-[4.5rem] flex-grow text-sm leading-relaxed text-muted-foreground">
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-strong text-success-strong-foreground text-xs font-bold tracking-wide shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
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
                      "group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-black transition-all active:scale-[0.98]",
                      course.is_free
                        ? "bg-success-strong hover:bg-success-strong/90 text-success-strong-foreground"
                        : "bg-primary hover:bg-primary-hover text-primary-foreground"
                    )}
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {course.is_free ? (
                      <>
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-foreground opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-foreground"></span>
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
            </CarouselItem>
          ))}
            </CarouselContent>
            {/* Arrows only when there is somewhere to go. */}
            {courses.length > 1 && (
              <>
                <CarouselPrevious className="hidden sm:flex -left-4" />
                <CarouselNext className="hidden sm:flex -right-4" />
              </>
            )}
          </Carousel>
          {courses.length > 1 && (
            <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">Swipe to see more courses</p>
          )}
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