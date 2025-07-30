import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Play, Clock, BookOpen, Users, Star, ExternalLink } from "lucide-react";
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
  const [enrollmentData, setEnrollmentData] = useState({
    userName: "",
    userEmail: "",
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
    if (!selectedCourse || !enrollmentData.userName || !enrollmentData.userEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: selectedCourse.id,
          user_name: enrollmentData.userName,
          user_email: enrollmentData.userEmail,
        });

      if (error) throw error;
      
      toast.success("Successfully enrolled in the course!");
      setEnrollmentData({ userName: "", userEmail: "" });
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the latest technologies with our comprehensive courses designed for real-world success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div 
                className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5 h-48"
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
                      4.8
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
                      <p className="font-semibold">2.5k+</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Star className="w-6 h-6 mx-auto mb-2 text-primary fill-current text-yellow-500" />
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">4.8/5</p>
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
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Course Content</h3>
                    <div className="space-y-2">
                      {courseContent.map((content, index) => (
                        <div
                          key={content.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            content.is_free 
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{content.title}</p>
                              {content.description && (
                                <p className="text-sm text-muted-foreground">{content.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {content.duration_minutes && (
                              <span className="text-xs text-muted-foreground">
                                {content.duration_minutes}min
                              </span>
                            )}
                            {content.content_type === "video" && <Play className="w-4 h-4" />}
                            {!content.is_free && <Lock className="w-4 h-4 text-amber-500" />}
                            {content.is_free && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                Free
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enrollment Form */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Enroll in this Course</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="userName">Full Name</Label>
                        <Input
                          id="userName"
                          value={enrollmentData.userName}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, userName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userEmail">Email Address</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={enrollmentData.userEmail}
                          onChange={(e) => setEnrollmentData({ ...enrollmentData, userEmail: e.target.value })}
                          placeholder="Enter your email"
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