import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

interface DBCourseContent {
  id: string;
  course_id: string;
  section_id: string;
  title: string;
  description: string | null;
  content_type: string;
  content_data: any;
  is_free: boolean;
  order_index: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
  content_category?: string;
}

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
  status: string;
  difficulty_level: string;
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
      let courseId = editingCourse?.id;
      
      if (editingCourse) {
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
          .eq('id', editingCourse.id);
        if (courseError) throw courseError;
      } else {
        // Create new course
        const { data: newCourse, error: courseError } = await supabase
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
          .select()
          .single();
        if (courseError) throw courseError;
        courseId = newCourse.id;
      }

      // Save sections and content
      await saveSectionsAndContent(courseId!);
      
      showSuccess(editingCourse ? "Course updated successfully!" : "Course created successfully!");
      fetchCourses();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error saving course:", error);
      showError("Failed to save course");
    }
  };

  const saveSectionsAndContent = async (courseId: string) => {
    // Delete existing sections and content if editing
    if (editingCourse) {
      await supabase.from('course_content').delete().eq('course_id', courseId);
      await supabase.from('course_sections').delete().eq('course_id', courseId);
    }

    // Save sections
    for (const section of formData.sections) {
      const { data: savedSection, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseId,
          title: section.title,
          section_type: section.section_type,
          order_index: section.order_index,
          is_visible: section.is_visible ?? true,
          content: {}
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Save content for this section
      for (const content of section.contents) {
        const { error: contentError } = await supabase
          .from('course_content')
          .insert({
            course_id: courseId,
            section_id: savedSection.id,
            title: content.title,
            description: content.description,
            content_type: content.content_type,
            content_data: content.content_data,
            is_free: content.is_free,
            order_index: content.order_index,
            duration_minutes: content.duration_minutes
          });

        if (contentError) throw contentError;
      }
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

      const sectionIds: string[] = sections.map((s: any) => s.id);
      let contents: DBCourseContent[] = [];
      if (sectionIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('course_content')
            .select('*')
            .in('section_id', sectionIds)
            .order('order_index');
          if (error) throw error;
          contents = data ?? [];
        } catch (error) {
          console.error('Error fetching course contents:', error);
          contents = [];
        }
      }

      const contentsBySection: Record<string, any[]> = {};
      for (const content of contents) {
        if (!content.section_id) continue;
        if (!contentsBySection[content.section_id]) {
          contentsBySection[content.section_id] = [];
        }
        contentsBySection[content.section_id].push(content);
      }

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
          description: (section as any).description || '',
          order_index: section.order_index || 0,
          section_type: section.section_type || 'default',
          is_visible: section.is_visible !== false,
          contents: sectionContents
        };
      });
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
        const validContentType = (['lesson', 'video', 'text', 'quiz', 'assignment', 'lecture'] as const).includes(value as any)
          ? (value as ContentType)
          : 'lesson';
        section.contents[contentIndex].content_type = validContentType;
      }
      return { ...prev, sections: updatedSections };
    });
  };

  const addSection = () => {
    const newSection: CourseSection = {
      id: `temp-section-${Date.now()}`,
      course_id: editingCourse?.id || '',
      title: '',
      description: '',
      order_index: formData.sections.length,
      section_type: 'default',
      is_visible: true,
      contents: []
    };
    setFormData({ ...formData, sections: [...formData.sections, newSection] });
  };

  const deleteSection = async (sectionIndex: number) => {
    const section = formData.sections[sectionIndex];
    
    if (section.id && !section.id.startsWith('temp-')) {
      try {
        await supabase.from('course_content').delete().eq('section_id', section.id);
        await supabase.from('course_sections').delete().eq('id', section.id);
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
    
    const updatedSections = formData.sections.filter((_, i) => i !== sectionIndex);
    setFormData({ ...formData, sections: updatedSections });
  };

  const addContent = (sectionIndex: number) => {
    const section = formData.sections[sectionIndex];
    const newContent: CourseContent = {
      id: `temp-content-${Date.now()}`,
      course_id: editingCourse?.id || '',
      section_id: section.id || '',
      title: '',
      description: '',
      content_type: 'lesson',
      content_data: {},
      is_free: false,
      order_index: (section.contents?.length || 0)
    };
    
    const updatedSections = [...formData.sections];
    if (!updatedSections[sectionIndex].contents) {
      updatedSections[sectionIndex].contents = [];
    }
    updatedSections[sectionIndex].contents.push(newContent);
    setFormData({ ...formData, sections: updatedSections });
  };

  const deleteContent = async (sectionIndex: number, contentIndex: number) => {
    const content = formData.sections[sectionIndex].contents[contentIndex];
    
    if (content.id && !content.id.startsWith('temp-')) {
      try {
        await supabase.from('course_content').delete().eq('id', content.id);
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
    
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].contents = updatedSections[sectionIndex].contents.filter((_, i) => i !== contentIndex);
    setFormData({ ...formData, sections: updatedSections });
  };

  const updateContentField = (sectionIndex: number, contentIndex: number, field: string, value: any) => {
    const updatedSections = [...formData.sections];
    if (updatedSections[sectionIndex].contents) {
      (updatedSections[sectionIndex].contents[contentIndex] as any)[field] = value;
      setFormData({ ...formData, sections: updatedSections });
    }
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={formData.discount_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || null })}
                    placeholder="Discount percentage"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
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
                <Label htmlFor="banner_image">Banner Image URL</Label>
                <Input
                  id="banner_image"
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label>Technologies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  />
                  <Button type="button" onClick={addTechnology}>
                    <Plus className="w-4 h-4" />
                  </Button>
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

              {/* Section and Content Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course Sections & Content</h3>
                {formData.sections.map((section, sectionIndex) => (
                  <Card key={section.id || sectionIndex} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <Label>Section Title</Label>
                            <Input
                              value={section.title}
                              onChange={(e) => {
                                const updatedSections = [...formData.sections];
                                updatedSections[sectionIndex].title = e.target.value;
                                setFormData({ ...formData, sections: updatedSections });
                              }}
                              placeholder="Section title"
                            />
                          </div>
                          <div>
                            <Label>Section Type</Label>
                            <Input
                              value={section.section_type}
                              onChange={(e) => {
                                const updatedSections = [...formData.sections];
                                updatedSections[sectionIndex].section_type = e.target.value;
                                setFormData({ ...formData, sections: updatedSections });
                              }}
                              placeholder="Section type"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSection(sectionIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Section Content Management */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Section Contents</h4>
                        {section.contents && section.contents.length > 0 ? (
                          section.contents.map((content, contentIndex) => (
                            <Card key={content.id || contentIndex} className="p-3 border-l-4 border-l-primary/30">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">Content Title</Label>
                                      <Input
                                        value={content.title}
                                        onChange={(e) => updateContentField(sectionIndex, contentIndex, 'title', e.target.value)}
                                        placeholder="Content title"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Content Type</Label>
                                      <Select 
                                        value={content.content_type} 
                                        onValueChange={(value) => handleContentTypeChange(sectionIndex, contentIndex, value)}
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="lesson">Lesson</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="text">Text</SelectItem>
                                          <SelectItem value="quiz">Quiz</SelectItem>
                                          <SelectItem value="assignment">Assignment</SelectItem>
                                          <SelectItem value="lecture">Lecture</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteContent(sectionIndex, contentIndex)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div>
                                  <Label className="text-xs">Description</Label>
                                  <Textarea
                                    value={content.description}
                                    onChange={(e) => updateContentField(sectionIndex, contentIndex, 'description', e.target.value)}
                                    placeholder="Content description"
                                    className="min-h-[60px] text-sm"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <Label className="text-xs">Duration (minutes)</Label>
                                    <Input
                                      type="number"
                                      value={content.duration_minutes || ''}
                                      onChange={(e) => updateContentField(sectionIndex, contentIndex, 'duration_minutes', parseInt(e.target.value) || undefined)}
                                      placeholder="Duration"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-4">
                                    <Switch
                                      checked={content.is_free}
                                      onCheckedChange={(checked) => updateContentField(sectionIndex, contentIndex, 'is_free', checked)}
                                    />
                                    <Label className="text-xs">Free</Label>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No content items in this section</p>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addContent(sectionIndex)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Content
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSection}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={!formData.title || !formData.description}>
                  {editingCourse ? "Update" : "Create"} Course
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant={course.is_free ? "default" : "secondary"}>
                    {course.is_free ? "Free" : `৳${course.price}`}
                  </Badge>
                  <Badge variant="outline">{course.status}</Badge>
                </div>
                <Badge variant="outline">{course.difficulty_level}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground">Create your first course to get started.</p>
        </div>
      )}
    </div>
  );
}