import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { PostgrestError } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseEnrollmentManager from "./CourseEnrollmentManager";
import CourseCategoryManager from "./CourseCategoryManager";

// Using the exact variant types that the toast component expects
type ToastVariant = 'default' | 'destructive';
interface ToastOptions {
  title: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}
// Helper function for showing toast messages with explicit types
const useTypedToast = () => {
  const { toast: originalToast } = useToast();
  return {
    toast: (options: ToastOptions) => {
      originalToast({
        title: options.title,
        description: options.description,
        variant: options.variant || 'default',
        duration: options.duration
      });
    },
    error: (message: string) => {
      originalToast({
        title: 'Error',
        description: message,
        variant: 'destructive' as const,
      });
    },
    success: (message: string) => {
      originalToast({
        title: 'Success',
        description: message,
        variant: 'default' as const,
      });
    }
  };
};

interface DBCourseSection {
  id?: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  section_type: string;
  created_at?: string;
  updated_at?: string;
  is_visible?: boolean;
  content?: any;
}

interface CourseSection extends Omit<DBCourseSection, 'content' | 'created_at' | 'updated_at'> {
  id: string;
  contents: CourseContent[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  is_free: boolean;
  status: string;
  difficulty_level?: string;
  duration_hours?: number;
  banner_image?: string;
  category_id?: string | null;
  technologies: string[];
  learning_outcomes?: string[];
  requirements?: string[];
  target_audience?: string[];
  sections?: CourseSection[];
  student_count?: number;
  rating?: number;
  faqs?: { question: string; answer: string }[];
  created_at?: string;
  updated_at?: string;
}

type ContentType = 'video' | 'text' | 'quiz' | 'lesson' | 'assignment' | 'lecture' | 'project';

// Type for database course content
interface DBCourseContent {
  id: string;
  course_id: string;
  section_id: string;
  title: string;
  description: string | null;
  content_type: string; // This comes from DB as string, we'll validate it
  content_data: any;
  is_free: boolean;
  order_index: number;
  duration_minutes?: number;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
  content_category?: string; // Some DB schemas might use this
}

// Type for our application's course content
interface CourseContent {
  id: string;
  course_id: string;
  section_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  content_data: Record<string, any>;
  is_free: boolean;
  order_index: number;
  duration_minutes?: number;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely convert string to ContentType
function toContentType(type: string): ContentType {
  return (['video', 'text', 'quiz', 'lesson', 'assignment', 'lecture', 'project'] as const)
    .includes(type as any)
    ? type as ContentType
    : 'lesson';
}

interface FormData {
  title: string;
  description: string;
  short_description: string;
  price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  is_free: boolean;
  status: string // Changed to string to handle form input more flexibly;
  difficulty_level: string // Changed to string to handle form input more flexibly;
  duration_hours: number | null;
  banner_image: string;
  category_id: string | null;
  technologies: string[];
  learning_outcomes: string[];
  requirements: string[];
  target_audience: string[];
  sections: CourseSection[];
  rating: number;
  student_count: number;
  start_date?: string;
  course_includes: string[];
  instructor_id: string | null;
  faqs: { question: string; answer: string }[];
}

const initialFormData: FormData = {
  title: "",
  description: "",
  short_description: "",
  price: 0,
  discounted_price: null,
  discount_percentage: null,
  is_free: false,
  status: 'draft',
  difficulty_level: 'beginner',
  duration_hours: null,
  banner_image: "",
  category_id: null,
  technologies: [],
  learning_outcomes: [],
  requirements: [],
  target_audience: [],
  sections: [],
  rating: 0,
  student_count: 0,
  start_date: undefined,
  course_includes: [],
  instructor_id: null,
  faqs: [],
};

export default function CourseManager() {
  const { toast, error: showError, success: showSuccess } = useTypedToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newTechnology, setNewTechnology] = useState("");
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [instructorsList, setInstructorsList] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchInstructorsList();
  }, []);

  const fetchInstructorsList = async () => {
    try {
      const { data } = await (supabase.from("instructors" as any).select("id, name").eq("is_active", true).order("name") as any);
      setInstructorsList(data || []);
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const { data: cats } = await supabase.from("course_categories" as any).select("*").order("name");
      setCategories(cats || []);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCourses((data || []).map((c: any) => ({ ...c, faqs: Array.isArray(c.faqs) ? c.faqs : [] })) as Course[]);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      showError(error?.message || "Failed to load courses");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let courseId: string | null = editingCourse?.id || null;

      if (editingCourse && courseId) {
        // Update existing course
        const { error: courseError } = await supabase
          .from('courses')
          .update({
            title: formData.title,
            description: formData.description,
            short_description: formData.short_description,
            price: formData.price,
            discounted_price: formData.discounted_price,
            discount_percentage: formData.discount_percentage,
            is_free: formData.is_free,
            status: formData.status,
            difficulty_level: formData.difficulty_level,
            duration_hours: formData.duration_hours,
            banner_image: formData.banner_image,
            category_id: formData.category_id || null,
            technologies: formData.technologies,
            learning_outcomes: formData.learning_outcomes,
            requirements: formData.requirements,
            target_audience: formData.target_audience,
            rating: formData.rating,
            student_count: formData.student_count,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            course_includes: formData.course_includes,
            instructor_id: formData.instructor_id || null,
            faqs: formData.faqs || [],
          })
          .eq('id', courseId);
        if (courseError) throw courseError;
      } else {
        // Create new course and capture its id
        const { data: created, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: formData.title,
            description: formData.description,
            short_description: formData.short_description,
            price: formData.price,
            discounted_price: formData.discounted_price,
            discount_percentage: formData.discount_percentage,
            is_free: formData.is_free,
            status: formData.status,
            difficulty_level: formData.difficulty_level,
            duration_hours: formData.duration_hours,
            banner_image: formData.banner_image,
            category_id: formData.category_id || null,
            technologies: formData.technologies,
            learning_outcomes: formData.learning_outcomes,
            requirements: formData.requirements,
            target_audience: formData.target_audience,
            rating: formData.rating,
            student_count: formData.student_count,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            course_includes: formData.course_includes,
            instructor_id: formData.instructor_id || null,
            faqs: formData.faqs || [],
          })
          .select('id')
          .single();
        if (courseError) throw courseError;
        courseId = created?.id || null;
      }

      if (!courseId) throw new Error('Missing course id');

      // Sync sections and contents for this course
      await syncSectionsAndContents(courseId);

      showSuccess(editingCourse ? "Course updated successfully!" : "Course created successfully!");
      fetchCourses();
      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving course:", error);
      showError(error?.message || "Failed to save course");
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showSuccess("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      showError("Failed to delete course");
    }
  };

  const fetchCourseSections = async (courseId: string): Promise<CourseSection[]> => {
    try {
      setIsLoadingSections(true);
      
      // First get all sections for the course
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      if (sectionsError) throw sectionsError;
      
      // Get all course content for this course (including items without section_id)
      const { data: allContent, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      if (contentError) throw contentError;
      
      // Separate content into sectioned and general content
      const sectionedContent = (allContent || []).filter(content => content.section_id);
      const generalContent = (allContent || []).filter(content => !content.section_id);
      
      // Group sectioned content by section_id
      const contentsBySection: Record<string, DBCourseContent[]> = {};
      for (const content of sectionedContent) {
        if (!contentsBySection[content.section_id]) {
          contentsBySection[content.section_id] = [];
        }
        contentsBySection[content.section_id].push(content);
      }
      
      // Transform sections and their content
      const formattedSections = (sections || []).map(section => {
        const sectionContents: CourseContent[] = [];
        const sectionContentsData = contentsBySection[section.id] || [];
        
        for (const content of sectionContentsData) {
          try {
            const courseContent: CourseContent = {
              id: String(content.id),
              course_id: String(content.course_id || ''),
              section_id: content.section_id,
              title: String(content.title || 'Untitled'),
              description: String(content.description || ''),
              content_type: toContentType(content.content_type || 'lesson'),
              content_data: (content.content_data && typeof content.content_data === 'object' && !Array.isArray(content.content_data)) 
                ? content.content_data as Record<string, any> 
                : {},
              is_free: Boolean(content.is_free),
              order_index: Number(content.order_index) || 0,
              duration_minutes: content.duration_minutes ? Number(content.duration_minutes) : undefined,
              topics: content.topics || [],
              created_at: content.created_at,
              updated_at: content.updated_at
            };
            sectionContents.push(courseContent);
          } catch (error) {
            console.error('Error processing sectioned content:', content, error);
          }
        }
        
        return {
          id: section.id,
          course_id: section.course_id,
          title: section.title,
          description: ((section as any).content?.description) || '',
          order_index: section.order_index || 0,
          section_type: section.section_type || 'default',
          is_visible: section.is_visible !== false,
          contents: sectionContents
        };
      });
      
      // If there's general content (content without section_id), create a "General" section
      if (generalContent.length > 0) {
        const generalSectionContents: CourseContent[] = [];
        
        for (const content of generalContent) {
          try {
            const courseContent: CourseContent = {
              id: String(content.id),
              course_id: String(content.course_id || ''),
              section_id: 'general', // Use a special section_id for general content
              title: String(content.title || 'Untitled'),
              description: String(content.description || ''),
              content_type: toContentType(content.content_type || 'lesson'),
              content_data: (content.content_data && typeof content.content_data === 'object' && !Array.isArray(content.content_data)) 
                ? content.content_data as Record<string, any> 
                : {},
              is_free: Boolean(content.is_free),
              order_index: Number(content.order_index) || 0,
              duration_minutes: content.duration_minutes ? Number(content.duration_minutes) : undefined,
              topics: (content as any).topics || [],
              created_at: content.created_at,
              updated_at: content.updated_at
            };
            generalSectionContents.push(courseContent);
          } catch (error) {
            console.error('Error processing general content:', content, error);
          }
        }
        
        // Create a virtual "General" section for content without specific sections
        const generalSection: CourseSection = {
          id: 'general',
          course_id: courseId,
          title: 'General Content',
          description: 'Course content not organized in specific sections',
          order_index: -1, // Put it first
          section_type: 'general',
          is_visible: true,
          contents: generalSectionContents
        };
        
        // Add general section at the beginning
        return [generalSection, ...formattedSections];
      }
      
      return formattedSections;
    } catch (error) {
      console.error('Error fetching course sections:', error);
      const toastOptions = {
        title: 'Error' as const,
        description: 'Failed to load course content' as const,
        variant: 'destructive' as const,
      };
      toast(toastOptions);
      return [];
    } finally {
      setIsLoadingSections(false);
    }
  };

  async function syncSectionsAndContents(courseId: string) {
    try {
      const currentSections = formData.sections || [];

      // Fetch existing section ids
      const { data: existingSections } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
      const existingSectionIds = (existingSections || []).map((s: any) => String(s.id));

      const currentSectionIds = currentSections.map(s => String(s.id));
      const sectionsToDelete = existingSectionIds.filter(id => !currentSectionIds.includes(id));
      if (sectionsToDelete.length > 0) {
        await supabase.from('course_content').delete().in('section_id', sectionsToDelete);
        await supabase.from('course_sections').delete().in('id', sectionsToDelete);
      }

      const sectionIdMap: Record<string, string> = {};
      for (let index = 0; index < currentSections.length; index++) {
        const s = currentSections[index];
        if (String(s.id) === 'general') {
          sectionIdMap['general'] = 'general';
          continue;
        }

        const payload: any = {
          course_id: courseId,
          title: s.title,
          content: { description: s.description || '' },
          order_index: index,
          section_type: s.section_type || 'default',
          is_visible: s.is_visible !== false,
        };
        if (!s.id || String(s.id).startsWith('section-')) {
          const { data: inserted, error } = await supabase
            .from('course_sections')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          const newId = String((inserted as any).id);
          sectionIdMap[String(s.id)] = newId;
          s.id = newId;
        } else {
          const { error } = await supabase
            .from('course_sections')
            .update(payload)
            .eq('id', s.id);
          if (error) throw error;
          sectionIdMap[String(s.id)] = String(s.id);
        }
      }

      // Sync contents for each section
      for (const s of currentSections) {
        const isGeneral = String(s.id) === 'general';
        const resolvedSectionId = sectionIdMap[String(s.id)] || String(s.id);
        
        let existingContentsQuery = supabase
          .from('course_content')
          .select('id')
          .eq('course_id', courseId);
          
        if (isGeneral) {
          existingContentsQuery = existingContentsQuery.is('section_id', null);
        } else {
          existingContentsQuery = existingContentsQuery.eq('section_id', resolvedSectionId);
        }
        
        const { data: existingContents } = await existingContentsQuery;
        const existingContentIds = (existingContents || []).map((c: any) => String(c.id));

        const contents = (s.contents || []).map((c, idx) => ({ ...c, order_index: idx + 1 }));
        const currentContentIds = contents.map(c => String(c.id));
        const contentsToDelete = existingContentIds.filter(id => !currentContentIds.includes(id));
        if (contentsToDelete.length > 0) {
          await supabase.from('course_content').delete().in('id', contentsToDelete);
        }

        for (let i = 0; i < contents.length; i++) {
          const c = contents[i];
          const payload: any = {
            course_id: courseId,
            section_id: c.section_id === 'general' ? null : resolvedSectionId,
            title: c.title,
            description: c.description || null,
            content_type: c.content_type || 'lesson',
            content_data: c.content_data || {},
            is_free: !!c.is_free,
            order_index: i + 1,
            duration_minutes: c.duration_minutes ?? null,
            topics: c.topics || [],
          };
          if (!c.id || String(c.id).startsWith('content-')) {
            const { error } = await supabase.from('course_content').insert(payload);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('course_content')
              .update(payload)
              .eq('id', c.id);
            if (error) throw error;
          }
        }
      }
    } catch (err) {
      console.error('Error syncing sections/contents', err);
      throw err;
    }
  }

  const resetForm = () => {
    setEditingCourse(null);
    setFormData(initialFormData);
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTechnology.trim()]
      });
      setNewTechnology("");
    }
  };

  const handlePriceChange = (val: string) => {
    const price = parseFloat(val) || 0;
    let newDiscountedPrice = formData.discounted_price;
    if (formData.discount_percentage !== null && price > 0) {
      newDiscountedPrice = Number((price - (price * formData.discount_percentage / 100)).toFixed(2));
    }
    setFormData({ ...formData, price, discounted_price: newDiscountedPrice });
  };

  const handleDiscountedPriceChange = (val: string) => {
    const discounted = parseFloat(val) || null;
    let newPct = formData.discount_percentage;
    if (discounted !== null && formData.price && formData.price > 0) {
      newPct = Math.round(((formData.price - discounted) / formData.price) * 100);
    }
    setFormData({ ...formData, discounted_price: discounted, discount_percentage: newPct });
  };

  const handleDiscountPercentageChange = (val: string) => {
    const pct = parseFloat(val) || null;
    let newDiscountedPrice = formData.discounted_price;
    if (pct !== null && formData.price && formData.price > 0) {
      newDiscountedPrice = Number((formData.price - (formData.price * pct / 100)).toFixed(2));
    }
    setFormData({ ...formData, discount_percentage: pct, discounted_price: newDiscountedPrice });
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const handleEdit = async (course: Course) => {
    try {
      setEditingCourse(course);
      // Fetch basic course data first
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', course.id)
        .single() as {
          data: any | null;
          error: any;
        };
      if (courseError) {
        console.error('Course fetch error:', courseError);
        throw courseError;
      }
      if (!courseData) {
        throw new Error('Course not found');
      }
      // Fetch course sections separately using our existing function
      const sections = await fetchCourseSections(course.id);
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        short_description: courseData.short_description || '',
        price: courseData.price || 0,
        discounted_price: courseData.discounted_price || null,
        discount_percentage: courseData.discount_percentage || null,
        is_free: Boolean(courseData.is_free),
        status: courseData.status || 'draft',
        difficulty_level: courseData.difficulty_level || 'beginner',
        duration_hours: courseData.duration_hours || null,
        banner_image: courseData.banner_image || "",
        category_id: courseData.category_id || null,
        technologies: courseData.technologies || [],
        learning_outcomes: courseData.learning_outcomes || [],
        requirements: courseData.requirements || [],
        target_audience: courseData.target_audience || [],
        sections: sections,
        rating: courseData.rating || 0,
        student_count: courseData.student_count || 0,
        start_date: courseData.start_date ? new Date(courseData.start_date).toISOString().slice(0, 16) : undefined,
        course_includes: courseData.course_includes || [],
        instructor_id: courseData.instructor_id || null,
        faqs: courseData.faqs || [],
      });
      setShowDialog(true);
    } catch (error) {
      console.error('Error preparing edit form:', error);
      const errorMessage = `Failed to load course data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showError(errorMessage);
    }
  };

  const handleContentTypeChange = (sectionIndex: number, contentIndex: number, value: string) => {
    setFormData(prev => {
      const updatedSections = [...prev.sections];
      const section = updatedSections[sectionIndex];
      if (section && section.contents && section.contents[contentIndex]) {
        // Ensure the value is a valid ContentType
        const validContentType = (['lesson', 'video', 'text', 'quiz', 'assignment', 'lecture', 'project'] as const).includes(value as any)
          ? (value as ContentType)
          : 'lesson';
        section.contents[contentIndex].content_type = validContentType;
      }
      return { ...prev, sections: updatedSections };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Management</h2>
      </div>

      <Tabs defaultValue="courses" onValueChange={(val) => {
        if (val === 'courses') {
          fetchCourses();
        }
      }}>
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px] mb-6">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6 mt-0">
          <div className="flex justify-end">
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b pb-4">
              <DialogTitle>{editingCourse ? `Edit Course: ${editingCourse.title}` : "Create New Course"}</DialogTitle>
              <DialogDescription>
                {editingCourse ? "Edit course details and manage content sections" : "Create a new course with sections and content"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                {/* Basic Course Information */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter course title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Course Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter full course description"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="short_description">Short Description (for course header)</Label>
                      <Textarea
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="Enter short marketing summary"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (৳)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="Course price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discounted_price">Discounted Price (৳)</Label>
                      <Input
                        id="discounted_price"
                        type="number"
                        step="0.01"
                        value={formData.discounted_price || ''}
                        onChange={(e) => handleDiscountedPriceChange(e.target.value)}
                        placeholder="Discounted price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percentage || ''}
                        onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                        placeholder="e.g. 25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty_level">Difficulty Level</Label>
                      <Select
                        value={formData.difficulty_level}
                        onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration_hours">Duration (hours)</Label>
                      <Input
                        id="duration_hours"
                        type="number"
                        value={formData.duration_hours || ''}
                        onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || null })}
                        placeholder="Course duration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_date">Course Start Date</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        placeholder="Course start date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_count">Student Count</Label>
                      <Input
                        id="student_count"
                        type="number"
                        value={formData.student_count || 0}
                        onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) || 0 })}
                        placeholder="e.g. 150"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating || 0}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g. 4.8"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="banner_image">Banner Image URL</Label>
                      <Input
                        id="banner_image"
                        value={formData.banner_image}
                        onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                        placeholder="Image URL"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Technologies</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newTechnology}
                          onChange={(e) => setNewTechnology(e.target.value)}
                          placeholder="Add technology"
                          onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                        />
                        <Button type="button" onClick={addTechnology}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                       <Label>Learning Outcomes (one per line)</Label>
                       <Textarea 
                         placeholder="Enter what students will learn..."
                         value={formData.learning_outcomes?.join('\n') || ''}
                         onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value.split('\n').filter(l => l.trim() !== '')})}
                         rows={4}
                       />
                    </div>
                    <div className="md:col-span-2">
                       <Label>Requirements (one per line)</Label>
                       <Textarea 
                         placeholder="What are the prerequisites..."
                         value={formData.requirements?.join('\n') || ''}
                         onChange={(e) => setFormData({...formData, requirements: e.target.value.split('\n').filter(l => l.trim() !== '')})}
                         rows={3}
                       />
                    </div>
                    <div className="md:col-span-2">
                       <Label>Target Audience (one per line)</Label>
                       <Textarea 
                         placeholder="Who should take this course..."
                         value={formData.target_audience?.join('\n') || ''}
                         onChange={(e) => setFormData({...formData, target_audience: e.target.value.split('\n').filter(l => l.trim() !== '')})}
                         rows={2}
                       />
                    </div>
                    <div className="md:col-span-2">
                       <Label>Course Includes (one per line - shown in sidebar)</Label>
                       <Textarea 
                         placeholder="38 hours on-demand video&#10;24 articles and reading materials&#10;Full lifetime access&#10;Certificate of completion"
                         value={formData.course_includes?.join('\n') || ''}
                         onChange={(e) => setFormData({...formData, course_includes: e.target.value.split('\n').filter(l => l.trim() !== '')})}
                         rows={4}
                       />
                    </div>
                    <div>
                      <Label htmlFor="instructor_id">Assign Instructor</Label>
                      <Select
                        value={formData.instructor_id || "none"}
                        onValueChange={(value) => setFormData({ ...formData, instructor_id: value === "none" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- No Instructor --</SelectItem>
                          {instructorsList.map(instr => (
                            <SelectItem key={instr.id} value={instr.id}>{instr.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_free"
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                      />
                      <Label htmlFor="is_free">Free Course</Label>
                    </div>
                    <div>
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={formData.category_id || "none"}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Uncategorized --</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* FAQ Management Section */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Frequently Asked Questions (FAQs)</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        faqs: [...(formData.faqs || []), { question: "", answer: "" }]
                      })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {(!formData.faqs || formData.faqs.length === 0) ? (
                      <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                        <p className="text-sm italic">No FAQs added yet. Add questions prospective students might have.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.faqs.map((faq, idx) => (
                          <div key={idx} className="relative p-4 border rounded-lg bg-muted/30 space-y-3 group">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                const newFaqs = [...formData.faqs];
                                newFaqs.splice(idx, 1);
                                setFormData({ ...formData, faqs: newFaqs });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Question {idx + 1}</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => {
                                  const newFaqs = [...formData.faqs];
                                  newFaqs[idx].question = e.target.value;
                                  setFormData({ ...formData, faqs: newFaqs });
                                }}
                                placeholder="e.g. Is there any prerequisite for this course?"
                                className="bg-background"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Answer</Label>
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => {
                                  const newFaqs = [...formData.faqs];
                                  newFaqs[idx].answer = e.target.value;
                                  setFormData({ ...formData, faqs: newFaqs });
                                }}
                                placeholder="Provide a clear, helpful answer..."
                                rows={2}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Content Management */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Course Content</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSection: CourseSection = {
                          id: `section-${Date.now()}`,
                          course_id: editingCourse?.id || '',
                          title: 'New Section',
                          description: '',
                          order_index: (formData.sections?.length || 0),
                          section_type: 'default',
                          is_visible: true,
                          contents: []
                        };
                        setFormData(prev => ({
                          ...prev,
                          sections: [...(prev.sections || []), newSection]
                        }));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                  
                  {isLoadingSections && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      Loading course content...
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {formData.sections?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No sections yet. Add your first section to get started.</p>
                      </div>
                    ) : (
                      formData.sections?.map((section, sectionIndex) => (
                        <div key={section.id} className="border rounded-lg p-4 space-y-4 bg-card">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Section {sectionIndex + 1}
                              </span>
                              <Input
                                value={section.title}
                                onChange={(e) => {
                                  const newSections = [...(formData.sections || [])];
                                  newSections[sectionIndex] = { ...section, title: e.target.value };
                                  setFormData({ ...formData, sections: newSections });
                                }}
                                placeholder="Section title"
                                className="font-medium text-base"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSections = [...(formData.sections || [])];
                                newSections.splice(sectionIndex, 1);
                                setFormData({ ...formData, sections: newSections });
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          
                          <Textarea
                            value={section.description || ''}
                            onChange={(e) => {
                              const newSections = [...(formData.sections || [])];
                              newSections[sectionIndex] = { ...section, description: e.target.value };
                              setFormData({ ...formData, sections: newSections });
                            }}
                            placeholder="Section description (optional)"
                            className="min-h-[80px]"
                          />
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Content Items ({section.contents?.length || 0})
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newSections = [...(formData.sections || [])];
                                  const newContent: CourseContent = {
                                    id: `content-${Date.now()}`,
                                    section_id: section.id,
                                    title: 'New Lesson',
                                    description: '',
                                    content_type: 'lesson',
                                    is_free: false,
                                    duration_minutes: 0,
                                    order_index: (section.contents?.length || 0) + 1,
                                    content_data: {},
                                    topics: [],
                                    course_id: editingCourse?.id || ''
                                  };
                                  newSections[sectionIndex] = {
                                    ...section,
                                    contents: [...(section.contents || []), newContent]
                                  };
                                  setFormData({ ...formData, sections: newSections });
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Content
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              {section.contents?.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md bg-muted/20">
                                  <p className="text-sm">No content items. Add your first lesson.</p>
                                </div>
                              ) : (
                                section.contents?.map((content, contentIndex) => (
                                  <div key={content.id} className="border rounded-md bg-background">
                                    <div className="border-b bg-muted/30 px-4 py-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded">
                                            {contentIndex + 1}
                                          </span>
                                          <Input
                                            value={content.title}
                                            onChange={(e) => {
                                              const newSections = [...(formData.sections || [])];
                                              const contents = [...(section.contents || [])];
                                              contents[contentIndex] = { ...content, title: e.target.value };
                                              newSections[sectionIndex] = { ...section, contents };
                                              setFormData({ ...formData, sections: newSections });
                                            }}
                                            placeholder="Content title"
                                            className="font-medium border-0 bg-transparent shadow-none focus-visible:ring-1"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newSections = [...(formData.sections || [])];
                                            const contents = [...(section.contents || [])];
                                            contents.splice(contentIndex, 1);
                                            newSections[sectionIndex] = { ...section, contents };
                                            setFormData({ ...formData, sections: newSections });
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="p-4 space-y-4">
                                      {/* Content Preview */}
                                      <div className="bg-muted/50 rounded-md p-3">
                                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Content Preview</Label>
                                        {content.description ? (
                                          <div className="text-sm space-y-2">
                                            {content.description.split('\n').map((line, idx) => {
                                              if (line.trim().startsWith('✅')) {
                                                return (
                                                  <div key={idx} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                                    <span>✅</span>
                                                    <span>{line.replace('✅', '').trim()}</span>
                                                  </div>
                                                );
                                              } else if (line.trim().startsWith('📌')) {
                                                return (
                                                  <div key={idx} className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400 mt-3 first:mt-0">
                                                    <span>📌</span>
                                                    <span>{line.replace('📌', '').trim()}</span>
                                                  </div>
                                                );
                                              } else if (line.trim()) {
                                                return (
                                                  <div key={idx} className="ml-4 text-muted-foreground">
                                                    {line.trim()}
                                                  </div>
                                                );
                                              }
                                              return null;
                                            })}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground">No content preview available</p>
                                        )}
                                      </div>
                                      
                                      {/* Edit Content */}
                                      <div>
                                        <Label className="text-xs font-medium">Content Description</Label>
                                        <Textarea
                                          value={content.description || ''}
                                          onChange={(e) => {
                                            const newSections = [...(formData.sections || [])];
                                            const contents = [...(section.contents || [])];
                                            contents[contentIndex] = { ...content, description: e.target.value };
                                            newSections[sectionIndex] = { ...section, contents };
                                            setFormData({ ...formData, sections: newSections });
                                          }}
                                          placeholder="Enter content description with lessons (use ✅ for completed items, 📌 for lessons)"
                                          rows={6}
                                          className="text-sm font-mono"
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                          <Label htmlFor={`content-type-${content.id}`} className="text-xs">Type</Label>
                                          <Select
                                            value={content.content_type}
                                            onValueChange={(value) => handleContentTypeChange(sectionIndex, contentIndex, value)}
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="lesson">✅ Lesson</SelectItem>
                                              <SelectItem value="lecture">🎓 Lecture</SelectItem>
                                              <SelectItem value="video">📹 Video</SelectItem>
                                              <SelectItem value="text">📝 Text</SelectItem>
                                              <SelectItem value="quiz">❓ Quiz</SelectItem>
                                              <SelectItem value="assignment">📋 Assignment</SelectItem>
                                              <SelectItem value="project">🚀 Project</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div>
                                          <Label htmlFor={`duration-${content.id}`} className="text-xs">Duration (min)</Label>
                                          <Input
                                            id={`duration-${content.id}`}
                                            type="number"
                                            value={content.duration_minutes || ''}
                                            onChange={(e) => {
                                              const newSections = [...(formData.sections || [])];
                                              const contents = [...(section.contents || [])];
                                              contents[contentIndex] = {
                                                ...content,
                                                duration_minutes: e.target.value ? parseInt(e.target.value) : 0
                                              };
                                              newSections[sectionIndex] = { ...section, contents };
                                              setFormData({ ...formData, sections: newSections });
                                            }}
                                            className="h-8 text-xs"
                                            min="0"
                                            placeholder="180"
                                          />
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            id={`is-free-${content.id}`}
                                            checked={content.is_free}
                                            onCheckedChange={(checked) => {
                                              const newSections = [...(formData.sections || [])];
                                              const contents = [...(section.contents || [])];
                                              contents[contentIndex] = { ...content, is_free: checked };
                                              newSections[sectionIndex] = { ...section, contents };
                                              setFormData({ ...formData, sections: newSections });
                                            }}
                                          />
                                          <Label htmlFor={`is-free-${content.id}`} className="text-xs">Free Preview</Label>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                          <Label className="text-xs">Topics (one per line, will be shown as expandable list)</Label>
                                          <Textarea
                                            value={content.topics?.join('\n') || ''}
                                            onChange={(e) => {
                                              const newSections = [...(formData.sections || [])];
                                              const contents = [...(section.contents || [])];
                                              contents[contentIndex] = { ...content, topics: e.target.value.split('\n').filter(t => t.trim() !== '') };
                                              newSections[sectionIndex] = { ...section, contents };
                                              setFormData({ ...formData, sections: newSections });
                                            }}
                                            placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                                            className="min-h-[80px] text-xs"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge variant={content.content_type === 'video' ? 'default' : 'secondary'} className="text-xs">
                                            {content.content_type}
                                          </Badge>
                                          {content.is_free && (
                                            <Badge variant="outline" className="text-xs text-green-600">
                                              Free
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 pb-2 px-6">
              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingCourse ? "Update Course" : "Create Course"}
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses List */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="bg-muted px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Courses ({courses.length})</h3>
            <div className="text-sm text-muted-foreground">
              {courses.filter(c => c.status === 'published').length} published
            </div>
          </div>
        </div>
        
        <div className="divide-y">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{course.title}</h4>
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                      {course.is_free && <Badge variant="outline">Free</Badge>}
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span>
                          {course.is_free ? 'Free' : (course.discounted_price ? (
                            <>
                              ৳{course.discounted_price}
                              <span className="line-through ml-1">৳{course.price}</span>
                            </>
                          ) : `৳${course.price}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{course.student_count || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📚</span>
                        <span>{course.difficulty_level}</span>
                      </div>
                      {course.duration_hours && (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{course.duration_hours}h</span>
                        </div>
                      )}
                    </div>
                    
                    {course.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {course.technologies.slice(0, 4).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {course.technologies.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.technologies.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                          deleteCourse(course.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Create your first course to get started</p>
              <Button onClick={resetForm} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </div>
          )}
        </div>
      </div>
    </TabsContent>

        <TabsContent value="enrollments" className="space-y-6 mt-0">
          <CourseEnrollmentManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-0">
          <CourseCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}