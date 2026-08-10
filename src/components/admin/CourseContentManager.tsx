import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createRepository } from "@/integrations/supabase/repository";
import { courseContentConfig, courseConfig } from "@/adapters/entityConfigs";
import { useEntityManager } from "@/hooks/useEntityManager";
import { Plus, Edit, Trash2, FileText, HelpCircle, Code, Video, BookOpen } from "lucide-react";

const courseRepository = createRepository(courseConfig);

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "lecture", label: "Lecture", icon: BookOpen },
  { value: "article", label: "Article", icon: FileText },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "assignment", label: "Assignment", icon: FileText },
  { value: "project", label: "Project", icon: Code },
];

const defaultForm = {
  title: "",
  description: "",
  content_type: "video",
  // 'lesson' isn't a real content_category value (the DB enum is
  // video|text|quiz) — this used to be the default and silently failed
  // every write; 'text' is a real, valid default.
  content_category: "text",
  order_index: 0,
  is_free: false,
  duration_minutes: 0,
};

export default function CourseContentManager() {
  const { data: courses = [] } = courseRepository.useFindAll();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [contentForm, setContentForm] = useState(defaultForm);

  const { items: contents, openCreate, openEdit, remove, dialog } = useEntityManager(courseContentConfig, {
    filter: { course_id: selectedCourse },
    extraFields: { course_id: selectedCourse },
  });

  // Bespoke form (not EntityFormDialog), so it keeps its own local draft
  // state — re-synced from the hook's initialData whenever the dialog is
  // about to show a (possibly different) item.
  useEffect(() => {
    if (!dialog.open) return;
    if (dialog.initialData) {
      setContentForm({
        title: dialog.initialData.title,
        description: dialog.initialData.description || "",
        content_type: dialog.initialData.content_type,
        content_category: dialog.initialData.content_category ?? "text",
        order_index: dialog.initialData.order_index,
        is_free: dialog.initialData.is_free,
        duration_minutes: dialog.initialData.duration_minutes || 0,
      });
    } else {
      setContentForm({ ...defaultForm, order_index: contents.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog.open, dialog.initialData]);

  const handleContentSubmit = () => {
    dialog.onSubmit({
      ...contentForm,
      // Preserve whatever content_data the row already has on edit — this
      // used to be hardcoded to {} on every save, silently wiping real
      // stored content data each time an existing row was edited.
      content_data: dialog.initialData?.content_data ?? {},
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
              <Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {dialog.initialData ? "Edit Content" : "Add New Content"}
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
                        onValueChange={(value) => setContentForm({ ...contentForm, content_type: value })}
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
                      {dialog.initialData ? "Update Content" : "Create Content"}
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
                      onClick={() => openEdit(content)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(content)}
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
