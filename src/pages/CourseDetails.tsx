import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Lock, 
  Star, 
  Users, 
  Clock
} from "lucide-react";

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
  technologies: string[];
  rating?: number;
  student_count?: number;
}

interface CourseContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  content_data: any;
  is_free: boolean;
  duration_minutes?: number;
  order_index: number;
}

interface QuickViewProps {
  course: Course | null;
  content: CourseContent[];
  onEnroll: () => void;
  enrolling: boolean;
}

function QuickView({ course, content, onEnroll, enrolling }: QuickViewProps) {
  if (!course) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{course.title}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {course.banner_image && (
          <img 
            src={course.banner_image} 
            alt={course.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}
        
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {course.technologies?.map((tech: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          
          {/* Course Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{course.rating || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>{course.student_count || 0} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>{course.duration_hours || 0} hours</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              {course.discounted_price ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {course.is_free ? 'Free' : `৳${course.discounted_price}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ৳{course.price}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {course.discount_percentage}% OFF
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {course.is_free ? 'Free' : `৳${course.price}`}
                </div>
              )}
            </div>
            <Button 
              size="lg"
              onClick={onEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        </div>

        {/* Course Content */}
        {content.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Course Content</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {content.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.content_type} {item.duration_minutes && `• ${item.duration_minutes} min`}
                    </div>
                  </div>
                  {item.is_free ? (
                    <Badge variant="outline" className="text-xs">Free</Badge>
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
              {content.length > 5 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  +{content.length - 5} more lessons
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    user_name: "",
    user_email: "",
    whatsapp_number: "",
    profession: "",
    institute_name: ""
  });

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
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch content
      const { data: contentData, error: contentError } = await supabase
        .from("course_content")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (contentError) throw contentError;
      setContent(contentData || []);

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
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });

      setEnrollmentData({ 
        user_name: "", 
        user_email: "", 
        whatsapp_number: "", 
        profession: "", 
        institute_name: "" 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Course not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
      <DialogTrigger asChild>
        <Button onClick={() => setShowQuickView(true)} className="hidden">
          Open Course Details
        </Button>
      </DialogTrigger>
      
      <QuickView 
        course={course} 
        content={content} 
        onEnroll={handleEnrollment}
        enrolling={enrolling}
      />
      
      {/* Enrollment Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="hidden">Enroll</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={enrollmentData.user_name}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_name: e.target.value }))}
                placeholder="e.g., Salman Sakib"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={enrollmentData.user_email}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_email: e.target.value }))}
                placeholder="e.g., your.email@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={enrollmentData.whatsapp_number}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="+8801734567890"
                required
              />
            </div>
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={enrollmentData.profession}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="e.g., Software Developer, Student, etc."
              />
            </div>
            <div>
              <Label htmlFor="institute">Institute/Company Name</Label>
              <Input
                id="institute"
                value={enrollmentData.institute_name}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, institute_name: e.target.value }))}
                placeholder="e.g., University, Company, etc."
              />
            </div>
            <Button onClick={handleEnrollment} className="w-full" disabled={enrolling}>
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}