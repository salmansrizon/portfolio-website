import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText, HelpCircle, Code, Video, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Content {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  content_category: 'lesson' | 'quiz' | 'project' | 'assignment' | 'text' | 'video';
  order_index: number;
  is_free: boolean;
  duration_minutes?: number;
}

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "lecture", label: "Lecture", icon: BookOpen },
  { value: "article", label: "Article", icon: FileText },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "assignment", label: "Assignment", icon: FileText },
  { value: "project", label: "Project", icon: Code },
];

export default function CourseContentManager() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [contents, setContents] = useState<any[]>([]);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content_type: "video",
    content_category: "lesson" as any,
    order_index: 0,
    is_free: false,
    duration_minutes: 0,
  });

  // Fetch courses on mount
  useEffect(() => {
    supabase.from("courses").select("id, title").order("title").then(({ data }) => setCourses(data || []));
  }, []);
        title: "Error",
        description: "Failed to load contents",
        variant: "destructive",
      });
    }
  };

  const handleContentSubmit = async () => {
    try {
      const contentData = {
        ...contentForm,
        course_id: selectedCourse,
        content_data: {},
      };

      if (editingContent) {
        const { error } = await supabase
          .from("course_content")
          .update(contentData)
          .eq("id", editingContent.id);

        if (error) throw error;
        toast({ title: "Success", description: "Content updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_content")
          .insert(contentData);

        if (error) throw error;
        toast({ title: "Success", description: "Content created successfully" });
      }

      resetContentForm();
      fetchContents();
      setShowContentDialog(false);
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("course_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Content deleted successfully" });
      fetchContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const resetContentForm = () => {
    setEditingContent(null);
    setContentForm({
      title: "",
      description: "",
      content_type: "video",
      content_category: "lesson",
      order_index: contents.length,
      is_free: false,
      duration_minutes: 0,
    });
  };

  const getContentIcon = (type: string) => {
    const typeData = CONTENT_TYPES.find(t => t.value === type);
    const IconComponent = typeData?.icon || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Content Manager</h2>
      </div>

      <div>
        <Label htmlFor="course_select">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course to manage content" />
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
            <div className="flex items-center justify-between">
              <CardTitle>Course Content</CardTitle>
              <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetContentForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContent ? "Edit Content" : "Add New Content"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="content_title">Title</Label>
                      <Input
                        id="content_title"
                        value={contentForm.title}
                        onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_description">Description</Label>
                      <Textarea
                        id="content_description"
                        value={contentForm.description}
                        onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_type">Content Type</Label>
                      <Select 
                        value={contentForm.content_type} 
                        onValueChange={(value) => setContentForm({...contentForm, content_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="lecture">Lecture</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={contentForm.duration_minutes}
                          onChange={(e) => setContentForm({ ...contentForm, duration_minutes: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="order">Order Index</Label>
                        <Input
                          id="order"
                          type="number"
                          value={contentForm.order_index}
                          onChange={(e) => setContentForm({ ...contentForm, order_index: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_free"
                        checked={contentForm.is_free}
                        onCheckedChange={(checked) => setContentForm({ ...contentForm, is_free: checked })}
                      />
                      <Label htmlFor="is_free">Free Content</Label>
                    </div>
                    <Button onClick={handleContentSubmit} className="w-full">
                      {editingContent ? "Update Content" : "Create Content"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getContentIcon(content.content_type)}
                    <div>
                      <span className="font-medium">{content.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {content.content_type}
                        </Badge>
                        {content.is_free && (
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        )}
                        {content.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {content.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingContent(content);
                        setContentForm({
                          title: content.title,
                          description: content.description || "",
                          content_type: content.content_type,
                          content_category: content.content_category,
                          order_index: content.order_index,
                          is_free: content.is_free,
                          duration_minutes: content.duration_minutes || 0,
                        });
                        setShowContentDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContent(content.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {contents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No content added yet. Click "Add Content" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}