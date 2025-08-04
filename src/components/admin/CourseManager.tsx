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

type ContentType = 'video' | 'text' | 'quiz' | 'lesson' | 'assignment';

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
  return (['video', 'text', 'quiz', 'lesson', 'assignment'] as const)
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
    if (!editingCourse) return;
    try {
      // Update course data
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
        .eq('id', editingCourse.id);
      if (courseError) throw courseError;
      // Update sections
      const { error: sectionsError } = await supabase
        .from('course_sections')
        .upsert(
          formData.sections.map(section => ({
            id: section.id,
            course_id: editingCourse.id,
            title: section.title,
            description: section.description,
            order_index: section.order_index,
            section_type: section.section_type || 'default', // Default section type
            is_visible: true, // Default value
          } as DBCourseSection)),
          { onConflict: 'id' }
        );
      if (sectionsError) throw sectionsError;
      // Update contents
      const { error: contentsError } = await supabase
        .from('course_content')
        .upsert(
          formData.sections.flatMap(section => section.contents.map(content => ({
            ...content,
            course_id: editingCourse.id,
          }))),
          { onConflict: 'id' }
        );
      if (contentsError) throw contentsError;
      showSuccess("Course updated successfully!");
      fetchCourses();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error updating course:", error);
      showError("Failed to update course");
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
            const result = await supabase
              .from('course_content')
              .select('*')
              .in('section_id', sectionIds)
              .order('order_index') as { data: DBCourseContent[] | null; error: PostgrestError | null };
            contentsData = result.data;
            contentsError = result.error;
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
          description: (section as any).description || '', // Handle optional description field
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
        const validContentType = (['lesson', 'video', 'text', 'quiz', 'assignment'] as const).includes(value as any)
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
        <h2 className="text-2xl font-bold">Course Manager</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="discount_percentage">Discount %</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || null })}
                    placeholder="Discount percentage"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="banner_image">Banner Image URL</Label>
                <Input
                  id="banner_image"
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  placeholder="Image URL"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div>
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
              {/* Course Content Sections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Course Content
                    {isLoadingSections && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Loading content...
                      </span>
                    )}
                  </h4>
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
                <div className="space-y-4 border rounded-lg p-4">
                  {formData.sections?.map((section, sectionIndex) => (
                    <div key={section.id} className="border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...(formData.sections || [])];
                            newSections[sectionIndex] = { ...section, title: e.target.value };
                            setFormData({ ...formData, sections: newSections });
                          }}
                          placeholder="Section title"
                          className="border-0 p-0 text-base font-medium shadow-none focus-visible:ring-0"
                        />
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
                        value={section.description}
                        onChange={(e) => {
                          const newSections = [...(formData.sections || [])];
                          newSections[sectionIndex] = { ...section, description: e.target.value };
                          setFormData({ ...formData, sections: newSections });
                        }}
                        placeholder="Section description (optional)"
                        className="min-h-[60px]"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Content Items</span>
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
                                course_id: editingCourse?.id || '' // Will be set when saving
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
                        <div className="space-y-2">
                          {section.contents?.map((content, contentIndex) => (
                            <div key={content.id} className="flex items-start gap-3 p-3 border rounded-md">
                              <div className="flex-1 space-y-2">
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
                                  className="border-0 p-0 shadow-none focus-visible:ring-0"
                                />
                                <Textarea
                                  value={content.description}
                                  onChange={(e) => {
                                    const newSections = [...(formData.sections || [])];
                                    const contents = [...(section.contents || [])];
                                    contents[contentIndex] = { ...content, description: e.target.value };
                                    newSections[sectionIndex] = { ...section, contents };
                                    setFormData({ ...formData, sections: newSections });
                                  }}
                                  placeholder="Content description (optional)"
                                  className="min-h-[60px] text-sm"
                                />
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`content-type-${content.id}`} className="text-xs">Type:</Label>
                                    <Select
                                      value={content.content_type}
                                      onValueChange={(value) => handleContentTypeChange(sectionIndex, contentIndex, value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs w-[120px]">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="lesson">Lesson</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`duration-${content.id}`} className="text-xs">Duration (min):</Label>
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
                                      className="h-8 w-20 text-xs"
                                      min="0"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
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
                                </div>
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
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <Button onClick={handleSubmit} className="w-full">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-medium text-sm grid grid-cols-12 gap-4">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Students</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="col-span-4 font-medium">
                  <div className="truncate max-w-xs">{course.title}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{course.description}</div>
                </div>
                <div className="col-span-2">
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                  {course.is_free && <Badge variant="outline" className="ml-1">Free</Badge>}
                </div>
                <div className="col-span-2 text-sm">
                  {course.is_free ? 'Free' : course.discounted_price ? (
                    <span>
                      ৳{course.discounted_price}
                      <span className="line-through text-muted-foreground ml-1 text-xs">৳{course.price}</span>
                    </span>
                  ) : `৳${course.price}`}
                </div>
                <div className="col-span-2 text-sm">
                  {course.student_count || 0}
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No courses found. Create your first course.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}