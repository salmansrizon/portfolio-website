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
                      className="bg-white dark:bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50 group cursor-pointer"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {/* Header Section */}
                      <div className="relative bg-[#1a56db] text-white p-8 pb-10 flex flex-col items-center justify-center text-center overflow-hidden h-[200px] shrink-0">
                        {/* Decorative shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -translate-x-8 translate-y-8"></div>
                        
                        {/* Title */}
                        <h3 className="font-bold text-2xl z-10 uppercase tracking-wide leading-tight px-4 flex items-center justify-center gap-2">
                          {course.title}
                        </h3>
                        
                        {/* Registration Pill */}
                        <div className="mt-4 z-10 bg-[#0042a5] text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider border border-white/10 shadow-sm">
                          REGISTRATION NOW
                        </div>
                        
                        {/* Limited Seat available text */}
                        <div className="mt-2 text-[9px] z-10 text-blue-100 uppercase tracking-widest font-medium">Limited seat available</div>
                      </div>

                      {/* Body Content */}
                      <div className="p-6 flex flex-col flex-grow gap-5">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-foreground leading-snug flex items-center gap-2">
                             {course.title}
                             {course.is_free && (
                               <span className="bg-red-500 text-white text-[9px] h-4 px-1.5 rounded-full flex items-center gap-1 font-black animate-pulse shrink-0">
                                 FREE
                               </span>
                             )}
                          </h4>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {course.start_date && (
                              <div className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CourseCountdown startDate={course.start_date} showIcon={false} />
                              </div>
                            )}
                            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                              {course.difficulty_level || "beginner"}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-3 leading-relaxed flex-grow">
                          {course.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {course.technologies?.slice(0, 3).map(tech => (
                            <Badge key={tech} variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-gray-50 dark:bg-muted text-gray-600 dark:text-foreground border border-gray-200 dark:border-border/50 hover:bg-gray-100">
                              {tech}
                            </Badge>
                          ))}
                          {course.technologies?.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] font-medium rounded-full py-0.5 px-3 bg-gray-50 dark:bg-muted text-gray-600 dark:text-foreground border border-gray-200">
                              +{course.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/10">
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">{course.duration_hours ? `${course.duration_hours}h` : 'Self-paced'}</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-foreground">
                            {course.discounted_price ? (
                              <>
                                <span>৳ {course.discounted_price}</span>
                                <span className="text-xs text-gray-400 line-through font-normal">৳ {course.price}</span>
                              </>
                            ) : course.is_free ? (
                              <span className="text-emerald-600 font-black tracking-tight">FREE</span>
                            ) : (
                              <span>৳ {course.price}</span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-[#3b62f6] hover:bg-[#254ee6] text-white rounded-xl mt-1 h-12 font-semibold shadow-md transition-all active:scale-[0.98]"
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
