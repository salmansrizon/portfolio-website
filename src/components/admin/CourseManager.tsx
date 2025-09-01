import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { PostgrestError } from '@supabase/supabase-js';

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
  technologies: string[];
  sections?: CourseSection[];
  student_count?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

type ContentType = 'video' | 'text' | 'quiz' | 'lesson' | 'assignment' | 'lecture';

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
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
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
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely convert string to ContentType
function toContentType(type: string): ContentType {
  return (['video', 'text', 'quiz', 'lesson', 'assignment', 'lecture'] as const)
    .includes(type as any)
    ? type as ContentType
    : 'lesson';
}

interface FormData {
  title: string;
  description: string;
  price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  is_free: boolean;
  status: string // Changed to string to handle form input more flexibly;
  difficulty_level: string // Changed to string to handle form input more flexibly;
  duration_hours: number | null;
  banner_image: string;
  technologies: string[];
  sections: CourseSection[];
  rating: number;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  price: 0,
  discounted_price: null,
  discount_percentage: null,
  is_free: false,
  status: 'draft',
  difficulty_level: 'beginner',
  duration_hours: null,
  banner_image: "",
  technologies: [],
  sections: [],
  rating: 0,
};

export default function CourseManager() {
  const { toast, error: showError, success: showSuccess } = useTypedToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newTechnology, setNewTechnology] = useState("");
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showError("Failed to load courses");
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
            price: formData.price,
            discounted_price: formData.discounted_price,
            discount_percentage: formData.discount_percentage,
            is_free: formData.is_free,
            status: formData.status,
            difficulty_level: formData.difficulty_level,
            duration_hours: formData.duration_hours,
            banner_image: formData.banner_image,
            technologies: formData.technologies,
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
            price: formData.price,
            discounted_price: formData.discounted_price,
            discount_percentage: formData.discount_percentage,
            is_free: formData.is_free,
            status: formData.status,
            difficulty_level: formData.difficulty_level,
            duration_hours: formData.duration_hours,
            banner_image: formData.banner_image,
            technologies: formData.technologies,
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
    } catch (error) {
      console.error("Error saving course:", error);
      showError("Failed to save course");
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
      // First get all sections for the course with proper typing
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index') as unknown as {
          data: DBCourseSection[] | null;
          error: PostgrestError | null;
        };
      if (sectionsError) throw sectionsError;
      if (!sections) return [];
      // Get all contents for these sections in a single query
      const sectionIds: string[] = sections.map((s: any) => s.id);
      let contents: DBCourseContent[] = [];
      if (sectionIds.length > 0) {
        try {
          // Query contents with proper typing
          // Only run the query if sectionIds is not empty
          let contentsData: DBCourseContent[] | null = [];
          let contentsError: PostgrestError | null = null;
          if (sectionIds.length > 0) {
            const { data, error } = await supabase
              .from('course_content')
              .select('*')
              .in('section_id', sectionIds)
              .order('order_index');
            contentsData = data;
            contentsError = error;
            if (contentsError) throw contentsError;
            contents = contentsData ?? [];
          } else {
            contents = [];
          }
          // Ensure all contents have a section_id and proper types
          contents = contents.filter((content: DBCourseContent): content is DBCourseContent => {
            if (!content.section_id) return false;
            // Ensure required fields have proper types
            content.content_data = content.content_data || {};
            content.is_free = Boolean(content.is_free);
            content.order_index = Number(content.order_index) || 0;
            return true;
          });
        } catch (error) {
          console.error('Error fetching course contents:', error);
          // Continue with empty contents if there's an error
          contents = [];
        }
      }
      // Group contents by section_id with proper typing
      const contentsBySection: Record<string, any[]> = {};
      for (const content of contents) {
        if (!content.section_id) continue;
        if (!contentsBySection[content.section_id]) {
          contentsBySection[content.section_id] = [];
        }
        contentsBySection[content.section_id].push(content);
      }
      // Transform the data to match our CourseSection interface
      const formattedSections = sections.map(section => {
        const sectionContents: CourseContent[] = [];
        const sectionContentsData = section.id ? contentsBySection[section.id] || [] : [];
        for (const content of sectionContentsData) {
          try {
            const courseContent: CourseContent = {
              id: String(content.id),
              course_id: String(content.course_id || ''),
              section_id: content.section_id,
              title: String(content.title || 'Untitled'),
              description: String(content.description || ''),
              content_type: toContentType(content.content_type || 'lesson'),
              content_data: content.content_data || {},
              is_free: Boolean(content.is_free),
              order_index: Number(content.order_index) || 0,
              duration_minutes: content.duration_minutes ? Number(content.duration_minutes) : undefined,
              created_at: content.created_at,
              updated_at: content.updated_at
            };
            sectionContents.push(courseContent);
          } catch (error) {
            console.error('Error processing content:', content, error);
          }
        }
        return {
          id: section.id,
          course_id: section.course_id,
          title: section.title,
          description: ((section as any).content?.description) || '', // Read description from JSON content
          order_index: section.order_index || 0,
          section_type: section.section_type || 'default',
          is_visible: section.is_visible !== false, // default to true if not set
          contents: sectionContents
        };
      });
      return formattedSections;
    } catch (error) {
      console.error('Error fetching course sections:', error);
      // Use explicit type annotation to prevent deep type inference
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
        const resolvedSectionId = sectionIdMap[String(s.id)] || String(s.id);
        const { data: existingContents } = await supabase
          .from('course_content')
          .select('id')
          .eq('section_id', resolvedSectionId);
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
            section_id: resolvedSectionId,
            title: c.title,
            description: c.description || null,
            content_type: c.content_type || 'lesson',
            content_data: c.content_data || {},
            is_free: !!c.is_free,
            order_index: i + 1,
            duration_minutes: c.duration_minutes ?? null,
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
        price: courseData.price || 0,
        discounted_price: courseData.discounted_price || null,
        discount_percentage: courseData.discount_percentage || null,
        is_free: Boolean(courseData.is_free),
        status: courseData.status || 'draft',
        difficulty_level: courseData.difficulty_level || 'beginner',
        duration_hours: courseData.duration_hours || null,
        banner_image: courseData.banner_image || "",
        technologies: courseData.technologies || [],
        sections: sections,
        rating: courseData.rating || 0,
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
        const validContentType = (['lesson', 'video', 'text', 'quiz', 'assignment', 'lecture'] as const).includes(value as any)
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
                        placeholder="Enter course description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (৳)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
                        onChange={(e) => setFormData({ ...formData, discounted_price: parseFloat(e.target.value) || null })}
                        placeholder="Discounted price"
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
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_free"
                        checked={formData.is_free}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                      />
                      <Label htmlFor="is_free">Free Course</Label>
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
                                  <div key={content.id} className="border rounded-md p-4 bg-background space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-muted-foreground min-w-0">
                                            {contentIndex + 1}.
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
                                            className="font-medium"
                                          />
                                        </div>
                                        
                                        <Textarea
                                          value={content.description || ''}
                                          onChange={(e) => {
                                            const newSections = [...(formData.sections || [])];
                                            const contents = [...(section.contents || [])];
                                            contents[contentIndex] = { ...content, description: e.target.value };
                                            newSections[sectionIndex] = { ...section, contents };
                                            setFormData({ ...formData, sections: newSections });
                                          }}
                                          placeholder="Content description"
                                          rows={2}
                                          className="text-sm"
                                        />
                                        
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
                                              placeholder="0"
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
                                          
                                          <div className="flex justify-end">
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
                          {course.is_free ? 'Free' : course.discounted_price ? (
                            <>
                              ৳{course.discounted_price}
                              <span className="line-through ml-1">৳{course.price}</span>
                            </>
                          ) : `৳${course.price}`}
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
    </div>
  );
}