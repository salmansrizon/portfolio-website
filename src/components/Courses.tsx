import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Play, Star, Users, ChevronDown, ChevronUp, Lock, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseCountdown } from "@/components/CourseCountdown";

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
  rating: number | null;
  student_count: number | null;
  discount_percentage: number | null;
  discounted_price: number | null;
  original_price: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  start_date?: string;
  course_content?: CourseContent[]; // Flat list of all content items
  sections?: CourseSection[]; // Grouped content by sections
}

interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  contents: CourseContent[];
}

interface CourseContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  is_free: boolean;
  duration_minutes?: number;
  order_index: number;
  section_id?: string; // Made optional to handle existing data
  content_category?: string;
  content_data?: any;
  course_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  // Helper function to format description with emojis and line breaks
  const formatDescription = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines to handle paragraphs
    return (
      <>
        {text.split('\n\n').map((paragraph, i, arr) => (
          <span key={i}>
            {paragraph.split('\n').map((line, j, lines) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
            {i < arr.length - 1 && <><br /><br /></>}
          </span>
        ))}
      </>
    );
  };
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [enrollmentData, setEnrollmentData] = useState({
    user_name: "",
    user_email: "",
    whatsapp_number: "",
    profession: "",
    institute_name: ""
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from Supabase...');
      
      // First, let's check if we can connect to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session ? 'Authenticated' : 'Not authenticated');
      
      // Use a simple query to get all fields
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log('Fetched courses:', data?.length || 0);
      
      // Define a type for the raw course data from the database
      type RawCourse = Omit<Course, 'original_price' | 'discounted_price' | 'discount_percentage'> & {
        original_price?: number;
        discounted_price?: number | null;
        discount_percentage?: number | null;
      };

      // Transform the data to match our Course interface
      const courses: Course[] = (data || []).map((rawCourse: RawCourse) => {
        // Ensure all required fields have proper defaults
        const transformedCourse: Course = {
          ...rawCourse,
          banner_image: rawCourse.banner_image || null,
          technologies: Array.isArray(rawCourse.technologies) ? rawCourse.technologies : [],
          duration_hours: rawCourse.duration_hours ?? null,
          difficulty_level: rawCourse.difficulty_level || 'beginner',
          rating: rawCourse.rating ?? null,
          student_count: rawCourse.student_count ?? null,
          discount_percentage: rawCourse.discount_percentage ?? null,
          discounted_price: rawCourse.discounted_price ?? null,
          // Handle the case where original_price might not exist in the database
          original_price: rawCourse.original_price ?? rawCourse.price,
          created_at: rawCourse.created_at || new Date().toISOString(),
          updated_at: rawCourse.updated_at || new Date().toISOString(),
          status: rawCourse.status || 'published'
        };
        return transformedCourse;
      });
      
      if (courses.length > 0) {
        console.log('First course sample:', {
          id: courses[0].id,
          title: courses[0].title,
          price: courses[0].price,
          is_free: courses[0].is_free,
          status: courses[0].status,
          original_price: courses[0].original_price,
          discounted_price: courses[0].discounted_price
        });
      }

      setCourses(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseContent = async (courseId: string) => {
    try {
      // Fetch sections for this course
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      if (sectionsError) throw sectionsError;

      // Fetch all content items for this course
      const { data: contentData, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      if (contentError) throw contentError;

      // Group content by section_id (including uncategorized)
      const bySection: Record<string, CourseContent[]> = {};
      (contentData || []).forEach((c: any) => {
        const key = c.section_id || 'uncategorized';
        if (!bySection[key]) bySection[key] = [];
        bySection[key].push(c as CourseContent);
      });

      // Build sections with their contents
      const sections: CourseSection[] = (sectionsData || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        order_index: s.order_index || 0,
        contents: bySection[s.id] || []
      }));

      // If there are uncategorized contents, show them first as a general section
      if (bySection['uncategorized'] && bySection['uncategorized'].length > 0) {
        sections.unshift({
          id: 'no-section',
          title: 'General',
          description: '',
          order_index: -1,
          contents: bySection['uncategorized']
        });
      }

      // Update selected course and list
      setSelectedCourse(prevCourse => {
        if (!prevCourse) return null;
        return {
          ...prevCourse,
          course_content: contentData || [],
          sections
        };
      });

      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, course_content: contentData || [], sections }
            : course
        )
      );
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Failed to load course content');
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    fetchCourseContent(course.id);
  };

  const handleEnrollment = async () => {
    if (!selectedCourse || !enrollmentData.user_name || !enrollmentData.user_email || !enrollmentData.whatsapp_number || !enrollmentData.profession || !enrollmentData.institute_name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: selectedCourse.id,
          user_name: enrollmentData.user_name,
          user_email: enrollmentData.user_email,
          whatsapp_number: enrollmentData.whatsapp_number,
          profession: enrollmentData.profession,
          institute_name: enrollmentData.institute_name,
        });

      if (error) throw error;
      
      toast.success("Successfully enrolled in the course!");
      setEnrollmentData({ user_name: "", user_email: "", whatsapp_number: "", profession: "", institute_name: "" });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loading Courses...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Professional Courses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-primary font-semibold">
            Master the latest technologies with our comprehensive courses designed for real-world success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div 
                className="relative justify-center overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5 h-48"
                onClick={() => handleCourseSelect(course)}
              >
                {course.banner_image ? (
                  <img
                    src={course.banner_image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                {/* <div className="absolute top-4 right-4">
                  {course.is_free ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Free</Badge>
                  ) : (
                    <Badge variant="secondary">{course.price}</Badge>
                  )}
                </div> */}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    {course.start_date && (
                      <CourseCountdown startDate={course.start_date} showIcon={false} />
                    )}
                    {course.difficulty_level && (
                      <Badge className={getDifficultyColor(course.difficulty_level)}>
                        {course.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {course.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {course.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{course.duration_hours ? `${course.duration_hours}h` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      {course.is_free ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md">
                          Free
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {course.discounted_price ? (
                            <>
                              <span className="font-semibold text-foreground">
                              ৳ {course.discounted_price}
                              </span>
                              {course.original_price && course.original_price > course.discounted_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ৳ {course.original_price}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-medium text-foreground">
                              ৳ {course.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button 
                      size="lg"
                      className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
                      onClick={() => handleCourseSelect(course)}
                    >
                      View Course Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">Check back soon for new courses!</p>
          </div>
        )}

        {/* Course Detail Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedCourse && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
                  <DialogDescription className="text-base">
                    {selectedCourse.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Course Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{selectedCourse.duration_hours || 0}h</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-semibold capitalize">{selectedCourse.difficulty_level || "All"}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="font-semibold">{selectedCourse.student_count}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Star className="w-6 h-6 mx-auto mb-2 text-primary fill-current" />
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">{selectedCourse.rating}/5</p>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {selectedCourse.sections?.length || 0} {selectedCourse.sections?.length === 1 ? 'module' : 'modules'}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedCourse.course_content?.length || 0} {selectedCourse.course_content?.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </div>
                    </div>
                    
                    {selectedCourse.sections && selectedCourse.sections.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCourse.sections.map((section, sectionIndex) => (
                          <div key={section.id} className="border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                  {sectionIndex + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">{section.title}</h4>
                                  {section.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-2">
                                {section.contents && section.contents.length > 0 ? (
                                  section.contents.map((content, contentIndex) => (
                                    <div 
                                      key={content.id} 
                                      className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mt-0.5">
                                        {contentIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-sm text-foreground">{content.title}</p>
                                          {content.content_type === "video" && (
                                            <Play className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                          )}
                                        </div>
                                        {content.description && (
                                          <div className="mt-1">
                                            <p className={`text-sm text-muted-foreground ${!expandedDescriptions[content.id] ? 'line-clamp-2' : ''}`}>
                                              {formatDescription(content.description)}
                                            </p>
                                            {content.description.length > 100 && (
                                              <button 
                                                onClick={() => setExpandedDescriptions(prev => ({
                                                  ...prev,
                                                  [content.id]: !prev[content.id]
                                                }))}
                                                className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                                              >
                                                {expandedDescriptions[content.id] ? (
                                                  <>
                                                    <span>Show less</span>
                                                    <ChevronUp className="w-3 h-3" />
                                                  </>
                                                ) : (
                                                  <>
                                                    <span>Read more</span>
                                                    <ChevronDown className="w-3 h-3" />
                                                  </>
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                          <Badge variant="outline" className="text-xs font-normal h-5">
                                            {content.content_type || 'Lesson'}
                                          </Badge>
                                          {content.duration_minutes && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {content.duration_minutes} min
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 ml-2">
                                        {!content.is_free ? (
                                          <Lock className="w-4 h-4 text-amber-500" />
                                        ) : (
                                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400">
                                            Free
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground text-sm">
                                    No lessons in this section yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No course content available yet.</p>
                        <p className="text-xs mt-1">Check back later for updates</p>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Form */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Enroll in this Course</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="userName">Full Name</Label>
                        <Input
                          id="userName"
                          value={enrollmentData.user_name}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, user_name: e.target.value })}
                          placeholder="e.g., Salman Sakib"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="userEmail">Email Address</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={enrollmentData.user_email}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, user_email: e.target.value })}
                          placeholder="e.g., your.email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp_number">Your Whatsapp Number</Label>
                        <Input
                          id="whatsapp_number"
                          type="phone"
                          value={enrollmentData.whatsapp_number}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, whatsapp_number: e.target.value })}
                          required
                          placeholder="+8801734567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Profession</Label>
                        <Input
                          id="profession"
                          type="text"
                          value={enrollmentData.profession}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, profession: e.target.value })}
                          placeholder="e.g., Software Developer, Student, etc."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="institute_name">Institute Name</Label>
                        <Input
                          id="institute_name"
                          type="text"
                          value={enrollmentData.institute_name}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, institute_name: e.target.value })}
                          placeholder="e.g., University, Company, etc."
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3 pb-4">
                    <Card className="text-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">Course Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedCourse.is_free ? (
                            <div className="text-2xl font-bold text-green-600">Free</div>
                          ) : selectedCourse.discounted_price ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary">
                                ৳ {selectedCourse.discounted_price}
                                </span>
                                {selectedCourse.original_price && selectedCourse.original_price > selectedCourse.discounted_price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ৳ {selectedCourse.original_price}
                                  </span>
                                )}
                              </div>
                              {selectedCourse.discount_percentage && (
                                <div className="text-sm text-muted-foreground">
                                  {selectedCourse.discount_percentage}% discount applied
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-primary">
                              ৳ {selectedCourse.price}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button onClick={handleEnrollment} size="lg">
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}