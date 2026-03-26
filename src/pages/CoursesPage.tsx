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
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Categories */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-background/60 backdrop-blur-md border border-border/50 shadow-sm rounded-2xl overflow-hidden sticky top-24">
              <div className="p-5 border-b border-border/50 bg-muted/20">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" /> Categories
                </h3>
              </div>
              <div className="p-4 space-y-1">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  All Courses
                </button>
                
                {rootCategories.map(root => (
                  <div key={root.id} className="space-y-1 pt-2">
                    <button 
                      onClick={() => setSelectedCategory(root.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === root.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-foreground'}`}
                    >
                      {root.name}
                    </button>
                    
                    {/* Subcategories */}
                    <div className="pl-4 space-y-1 border-l-2 border-muted ml-3">
                      {getSubcategories(root.id).map(sub => (
                        <button 
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === sub.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Course Grid */}
          <div className="flex-1">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Courses'}
                <span className="ml-3 text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredCourses.length}
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[450px] bg-card border rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                  <ScrollReveal key={course.id} direction="up" delay={index * 0.05}>
                    <div className="bg-background/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50 group">
                      {/* Image top curve design */}
                      <div className="relative bg-gradient-to-br from-primary to-blue-500 text-white p-6 pb-8 flex flex-col items-center justify-center text-center overflow-hidden h-[180px] shrink-0">
                        {course.banner_image && (
                          <img src={course.banner_image} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="" />
                        )}
                        <h3 className="font-bold text-xl z-10 uppercase tracking-wide leading-tight px-4">
                          {course.title}
                        </h3>
                        {course.start_date && (
                          <div className="mt-4 z-10 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full tracking-wider border border-white/10">
                            REGISTRATION OPEN
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow gap-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-foreground line-clamp-1">{course.title}</h4>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-2 leading-relaxed flex-grow">
                          {course.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {course.technologies.slice(0, 2).map(tech => (
                            <Badge key={tech} variant="secondary" className="text-[9px] font-medium rounded-full py-0 px-2 bg-muted text-gray-700 dark:text-foreground">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm py-2 border-t border-border mt-2">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">{course.duration_hours || '10'}h</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-foreground">
                            {course.is_free ? (
                              <Badge className="bg-green-500 hover:bg-green-600 text-[10px] text-white px-2 py-0 h-5 border-none shadow-sm flex items-center gap-1.5 font-bold shrink-0">
                                <div className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </div>
                                FREE
                              </Badge>
                            ) : course.discounted_price ? (
                              <>
                                <span>৳ {course.discounted_price}</span>
                                <span className="text-xs text-gray-400 line-through font-normal">৳ {course.price}</span>
                              </>
                            ) : (
                              <span>৳ {course.price}</span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl h-11 font-semibold shadow-sm hover:shadow-md transition-all"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          View Details
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
