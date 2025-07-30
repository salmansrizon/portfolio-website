import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Lock, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Users, 
  Clock, 
  Target,
  Briefcase,
  TrendingUp,
  ArrowLeft
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  banner_image?: string;
  price?: number;
  is_free: boolean;
  difficulty_level?: string;
  duration_hours?: number;
  technologies: string[];
}

interface CourseSection {
  id: string;
  section_type: string;
  title: string;
  content: any;
  order_index: number;
  is_visible: boolean;
}

interface CourseContent {
  id: string;
  title: string;
  content_type: string;
  content_data: any;
  is_free: boolean;
  duration_minutes?: number;
  order_index: number;
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState({
    user_name: "",
    user_email: ""
  });
  const [openSections, setOpenSections] = useState<string[]>([]);

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

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_visible", true)
        .order("order_index");

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

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
    if (!enrollmentData.user_name || !enrollmentData.user_email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: courseId,
          user_name: enrollmentData.user_name,
          user_email: enrollmentData.user_email,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });

      setEnrollmentData({ user_name: "", user_email: "" });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      target: Target,
      briefcase: Briefcase,
      chart: TrendingUp,
      users: Users,
      clock: Clock,
      star: Star
    };
    const IconComponent = iconMap[iconName] || Target;
    return <IconComponent className="w-6 h-6" />;
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderSectionContent = (section: CourseSection) => {
    const { content } = section;

    switch (section.section_type) {
      case "what_you_learn":
      case "who_is_for":
      case "prerequisites":
      case "benefits":
        return (
          <ul className="space-y-2">
            {content.items?.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case "objectives":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.items?.map((item: any, index: number) => (
              <div key={index} className="flex flex-col items-center text-center p-4 border rounded-lg">
                {getIcon(item.icon)}
                <h4 className="font-semibold mt-2 mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        );

      case "curriculum":
        return (
          <div className="space-y-4">
            {content.modules?.map((module: any, index: number) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 ml-11 space-y-2">
                  {module.lessons?.map((lesson: any, lessonIndex: number) => (
                    <div key={lessonIndex} className="flex items-center gap-2 p-2 text-sm">
                      {lesson.is_free ? (
                        <Play className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{lesson.title}</span>
                      {lesson.duration && (
                        <span className="ml-auto text-muted-foreground">{lesson.duration}</span>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        );

      case "projects":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.projects?.map((project: any, index: number) => (
              <Card key={index}>
                {project.image && (
                  <img src={project.image} alt={project.title} className="w-full h-40 object-cover rounded-t-lg" />
                )}
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "testimonials":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.testimonials?.map((testimonial: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    {testimonial.avatar && (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.company && (
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "instructors":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.instructors?.map((instructor: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {instructor.avatar && (
                      <img src={instructor.avatar} alt={instructor.name} className="w-20 h-20 rounded-full" />
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{instructor.name}</h4>
                      <p className="text-primary font-medium mb-2">{instructor.title}</p>
                      <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "faqs":
        return (
          <div className="space-y-4">
            {content.faqs?.map((faq: any, index: number) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50 text-left">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        );

      default:
        return <p>Content not available</p>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.difficulty_level && (
                  <Badge className={getDifficultyColor(course.difficulty_level)}>
                    {course.difficulty_level}
                  </Badge>
                )}
                {course.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {course.duration_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>All levels</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  {course.banner_image && (
                    <img 
                      src={course.banner_image} 
                      alt={course.title} 
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="text-center mb-6">
                    {course.is_free ? (
                      <span className="text-2xl font-bold text-green-600">Free</span>
                    ) : (
                      <span className="text-2xl font-bold">${course.price}</span>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full mb-4">Enroll Now</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enroll in {course.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={enrollmentData.user_name}
                            onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={enrollmentData.user_email}
                            onChange={(e) => setEnrollmentData(prev => ({ ...prev, user_email: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleEnrollment} className="w-full">
                          Complete Enrollment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                {sections.filter(s => ['what_you_learn', 'who_is_for', 'prerequisites', 'benefits', 'objectives', 'testimonials', 'instructors', 'faqs'].includes(s.section_type)).map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {section.title}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                        >
                          {openSections.includes(section.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <Collapsible open={openSections.includes(section.id)} onOpenChange={() => toggleSection(section.id)}>
                      <CollapsibleContent>
                        <CardContent>
                          {renderSectionContent(section)}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {content.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.content_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.duration_minutes && (
                              <span className="text-sm text-muted-foreground">{item.duration_minutes} min</span>
                            )}
                            {item.is_free ? (
                              <Play className="w-5 h-5 text-green-500" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="projects">
                {sections.find(s => s.section_type === 'projects') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Projects & Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderSectionContent(sections.find(s => s.section_type === 'projects')!)}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Community support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Certificate of completion</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}