import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface CourseSection {
  id?: string;
  course_id: string;
  section_type: string;
  title: string;
  content: any;
  order_index: number;
  is_visible: boolean;
}

const SECTION_TYPES = [
  { value: "what_you_learn", label: "What You Will Learn" },
  { value: "who_is_for", label: "Who This Course Is For" },
  { value: "prerequisites", label: "Prerequisites" },
  { value: "benefits", label: "Course Benefits" },
  { value: "objectives", label: "Course Objectives" },
  { value: "curriculum", label: "Curriculum" },
  { value: "projects", label: "Projects & Assignments" },
  { value: "testimonials", label: "Testimonials" },
  { value: "instructors", label: "Instructors" },
  { value: "faqs", label: "FAQs" },
];

export default function CourseSectionsManager() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    section_type: "",
    title: "",
    content: "{}",
    order_index: 0,
    is_visible: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSections();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", selectedCourse)
        .order("order_index");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast({
        title: "Error",
        description: "Failed to load course sections",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      let content;
      try {
        content = JSON.parse(sectionForm.content);
      } catch {
        toast({
          title: "Error",
          description: "Invalid JSON in content field",
          variant: "destructive",
        });
        return;
      }

      const sectionData = {
        course_id: selectedCourse,
        section_type: sectionForm.section_type,
        title: sectionForm.title,
        content,
        order_index: sectionForm.order_index,
        is_visible: sectionForm.is_visible,
      };

      if (editingSection) {
        const { error } = await supabase
          .from("course_sections")
          .update(sectionData)
          .eq("id", editingSection.id);

        if (error) throw error;
        toast({ title: "Success", description: "Section updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_sections")
          .insert(sectionData);

        if (error) throw error;
        toast({ title: "Success", description: "Section created successfully" });
      }

      resetForm();
      fetchSections();
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving section:", error);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from("course_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Section deleted successfully" });
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const editSection = (section: CourseSection) => {
    setEditingSection(section);
    setSectionForm({
      section_type: section.section_type,
      title: section.title,
      content: JSON.stringify(section.content, null, 2),
      order_index: section.order_index,
      is_visible: section.is_visible,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingSection(null);
    setSectionForm({
      section_type: "",
      title: "",
      content: "{}",
      order_index: sections.length,
      is_visible: true,
    });
  };

  const getContentTemplate = (sectionType: string) => {
    switch (sectionType) {
      case "what_you_learn":
      case "who_is_for":
      case "prerequisites":
      case "benefits":
        return JSON.stringify({
          items: [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        }, null, 2);

      case "objectives":
        return JSON.stringify({
          items: [
            {
              icon: "target",
              title: "Objective Title",
              description: "Objective description"
            }
          ]
        }, null, 2);

      case "curriculum":
        return JSON.stringify({
          modules: [
            {
              title: "Module 1: Introduction",
              lessons: [
                {
                  title: "Lesson 1",
                  is_free: true,
                  duration: "10 min"
                }
              ]
            }
          ]
        }, null, 2);

      case "projects":
        return JSON.stringify({
          projects: [
            {
              title: "Project Title",
              description: "Project description",
              image: "project-image-url.jpg"
            }
          ]
        }, null, 2);

      case "testimonials":
        return JSON.stringify({
          testimonials: [
            {
              name: "Student Name",
              company: "Company",
              content: "Testimonial content",
              rating: 5,
              avatar: "avatar-url.jpg"
            }
          ]
        }, null, 2);

      case "instructors":
        return JSON.stringify({
          instructors: [
            {
              name: "Instructor Name",
              title: "Job Title",
              bio: "Instructor biography",
              avatar: "avatar-url.jpg"
            }
          ]
        }, null, 2);

      case "faqs":
        return JSON.stringify({
          faqs: [
            {
              question: "FAQ Question",
              answer: "FAQ Answer"
            }
          ]
        }, null, 2);

      default:
        return "{}";
    }
  };

  const handleSectionTypeChange = (value: string) => {
    setSectionForm(prev => ({
      ...prev,
      section_type: value,
      title: SECTION_TYPES.find(t => t.value === value)?.label || "",
      content: getContentTemplate(value)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Sections Manager</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? "Edit Section" : "Add New Section"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section_type">Section Type</Label>
                  <Select value={sectionForm.section_type} onValueChange={handleSectionTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order_index">Order Index</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={sectionForm.order_index}
                    onChange={(e) => setSectionForm({ ...sectionForm, order_index: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={sectionForm.is_visible}
                    onCheckedChange={(checked) => setSectionForm({ ...sectionForm, is_visible: checked })}
                  />
                  <Label htmlFor="is_visible">Visible</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content (JSON)</Label>
                <Textarea
                  id="content"
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="Enter JSON content..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingSection ? "Update Section" : "Create Section"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <Label htmlFor="course_select">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course to manage sections" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Course Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{section.title}</h4>
                        <Badge variant="outline">{section.section_type}</Badge>
                        {!section.is_visible && (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Order: {section.order_index}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editSection(section)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSection(section.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {sections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No sections found for this course
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}