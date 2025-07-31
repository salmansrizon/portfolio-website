import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Play, Clock, BookOpen, Users, Star, ExternalLink, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  banner_image?: string;
  technologies: string[];
  price?: number;
  is_free: boolean;
  duration_hours?: number;
  difficulty_level?: string;
  rating?: number;
  student_count?: number;
}

interface CourseContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  is_free: boolean;
  duration_minutes?: number;
  order_index: number;
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseContent = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_content")
        .select("id, title, description, content_type, is_free, duration_minutes, order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setCourseContent(data || []);
    } catch (error) {
      console.error("Error fetching course content:", error);
      toast.error("Failed to load course content");
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
                <div className="absolute top-4 right-4">
                  {course.is_free ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Free</Badge>
                  ) : (
                    <Badge variant="secondary">${course.price}</Badge>
                  )}
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  {course.difficulty_level && (
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                  )}
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

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration_hours}h
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      {course.rating}/5
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleCourseSelect(course)}
                    >
                      Quick View
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
                      <Star className="w-6 h-6 mx-auto mb-2 text-primary fill-current text-yellow-500" />
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">{selectedCourse.rating}/5</p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Technologies Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Course Content</h3>
                      <span className="text-sm text-muted-foreground">
                        {courseContent.length} {courseContent.length === 1 ? 'module' : 'modules'}
                      </span>
                    </div>
                    
                    <Accordion type="multiple" className="w-full">
                      {courseContent.map((content, index) => (
                        <AccordionItem key={content.id} value={content.id} className="border-b">
                          <AccordionTrigger className="hover:no-underline [&[data-state=open]>svg]:rotate-180">
                            <div className="flex items-center gap-3 flex-1 text-left">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground">{content.title}</p>
                                  {content.content_type === "video" && (
                                    <Play className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
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
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 pl-4 pr-2">
                            {content.description && (
                              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                                {content.description}
                              </div>
                            )}
                            {!content.is_free && (
                              <div className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                                <Lock className="w-4 h-4 inline-block mr-1" />
                                This content is part of the premium course
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {selectedCourse.is_free ? "Free" : `$${selectedCourse.price}`}
                      </div>
                      <Button onClick={handleEnrollment} size="lg">
                        Enroll Now
                      </Button>
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