import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CourseCountdown } from "@/components/CourseCountdown";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

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
}

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: catData } = await supabase.from("course_categories" as any).select("*").order("name");
      setCategories((catData as any[]) || []);

      const { data: courseData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses((courseData as any[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? course.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Organize categories into hierarchy
  const rootCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
      <Navbar />
      
      {/* Hero Section - Aligned with homepage theme */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Blur Elements (matches Hero.tsx) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-blue-300/8 rounded-full blur-xl animate-float-delayed"></div>
        </div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-4 py-1.5 font-semibold">
              Explore Our Catalog
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-move">
                Master New Skills
              </span>
              <br />
              <span className="text-foreground">with Professional Courses</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Unlock your potential with our expert-led courses designed to take you from beginner to professional in weeks.
            </p>
            
            <div className="relative max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                className="w-full h-14 pl-12 bg-background/60 backdrop-blur-md border-border/50 text-foreground placeholder:text-muted-foreground rounded-2xl focus:bg-background/80 focus:border-primary/50 transition-all text-lg shadow-sm"
                placeholder="Search for courses, skills, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          
          {/* Main Content - Course Grid */}
          <div className="flex-1">
            <div className="mb-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Courses'}
                  <span className="ml-3 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {filteredCourses.length}
                  </span>
                </h2>
              </div>

              {/* Horizontal Category Filter (Top of Cards) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-1 px-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                    !selectedCategory 
                      ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                      : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                  )}
                >
                  All Courses
                </button>
                {rootCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm",
                      selectedCategory === cat.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105" 
                        : "bg-background/80 text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[450px] bg-card border rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.map((course, index) => (
                  <ScrollReveal key={course.id} direction="up" delay={index * 0.05}>
                    <div 
                      className="group relative flex flex-col h-full bg-card/40 backdrop-blur-md rounded-[32px] border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {/* Course Banner */}
                      <div className="relative h-56 w-full overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-600/90 z-10 group-hover:opacity-100 transition-opacity" />
                        {course.banner_image ? (
                          <img 
                            src={course.banner_image} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={course.title} 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                        )}
                        
                        {/* Overlay Content */}
                        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-start w-full">
                            {course.is_free ? (
                              <Badge className="bg-emerald-500/90 backdrop-blur-md border-none text-white px-3 py-1 font-black tracking-tighter text-[10px] animate-pulse">
                                FREE ACCESS
                              </Badge>
                            ) : (
                              <Badge className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-3 py-1 font-bold text-[10px]">
                                PREMIUM
                              </Badge>
                            )}
                            
                            {course.start_date && (
                              <CourseCountdown 
                                startDate={course.start_date} 
                                className="bg-white/10 backdrop-blur-xl text-white border border-white/20 font-black tracking-widest text-[9px] px-3 py-1.5 rounded-full"
                              />
                            )}
                          </div>
                          
                          <h3 className="text-white text-xl font-black leading-tight uppercase tracking-tight drop-shadow-lg line-clamp-2">
                             {course.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 italic font-medium leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {course.technologies.slice(0, 3).map(tech => (
                            <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.duration_hours || 'Self-paced'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span className="capitalize">{course.difficulty_level || 'All levels'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            {course.is_free ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-emerald-500 tracking-tighter uppercase">FREE</span>
                                <div className="h-1 w-6 bg-emerald-500 rounded-full mt-1" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black text-foreground tracking-tighter">৳{course.discounted_price || course.price}</span>
                                </div>
                                {course.discounted_price && (
                                  <span className="text-[10px] text-muted-foreground line-through font-bold">৳{course.price}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Shadow Button - Visible on Hover */}
                        <div className="mt-8 flex items-center gap-3 text-primary font-black text-sm group-hover:gap-5 transition-all cursor-pointer">
                          <span>VIEW CURRICULUM</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
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
                  onClick={() => {setSearchQuery(""); setSelectedCategory(null)}}
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
