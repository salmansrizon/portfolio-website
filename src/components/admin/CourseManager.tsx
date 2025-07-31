import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Play, FileText, HelpCircle, Lock, Unlock, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CourseSectionsManager from "./CourseSectionsManager";

interface Course {
  id: string;
  title: string;
  description: string;
  banner_image?: string;
  technologies: string[];
  price?: number;
  is_free: boolean;
  status: string;
  duration_hours?: number;
  difficulty_level?: string;
  rating?: number;
  student_count?: number;
}

interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content_type: string;
  content_data: any;
  is_free: boolean;
  order_index: number;
  duration_minutes?: number;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    banner_image: "",
    technologies: "",
    price: "",
    is_free: true,
    status: "draft",
    duration_hours: "",
    difficulty_level: "beginner",
    rating: "",
    student_count: "",
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content_type: "video",
    youtube_url: "",
    text_content: "",
    is_free: true,
    duration_minutes: "",
  });

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
      toast.error("Failed to load courses");
    }
  };

  const fetchCourseContent = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_content")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setCourseContent(data || []);
    } catch (error) {
      console.error("Error fetching course content:", error);
      toast.error("Failed to load course content");
    }
  };

  const handleCourseSubmit = async () => {
    try {
      const courseData = {
        ...courseForm,
        technologies: courseForm.technologies.split(",").map(t => t.trim()).filter(Boolean),
        price: courseForm.price ? parseFloat(courseForm.price) : null,
        duration_hours: courseForm.duration_hours ? parseInt(courseForm.duration_hours) : null,
        rating: courseForm.rating ? parseFloat(courseForm.rating) : null,
        student_count: courseForm.student_count ? parseInt(courseForm.student_count) : null,
      };

      let result;
      if (selectedCourse) {
        result = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", selectedCourse.id);
      } else {
        result = await supabase
          .from("courses")
          .insert([courseData]);
      }

      if (result.error) throw result.error;

      toast.success(selectedCourse ? "Course updated successfully!" : "Course created successfully!");
      setIsEditingCourse(false);
      setSelectedCourse(null);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    }
  };

  const handleContentSubmit = async () => {
    if (!selectedCourse) return;

    try {
      let contentData: any = {
        title: contentForm.title,
        description: contentForm.description,
        content_type: contentForm.content_type,
        is_free: contentForm.is_free,
        duration_minutes: contentForm.duration_minutes ? parseInt(contentForm.duration_minutes) : null,
      };

      // Prepare content_data based on type
      if (contentForm.content_type === "video") {
        contentData.content_data = { youtube_url: contentForm.youtube_url };
      } else if (contentForm.content_type === "text") {
        contentData.content_data = { text_content: contentForm.text_content };
      }

      if (selectedContent) {
        const { error } = await supabase
          .from("course_content")
          .update(contentData)
          .eq("id", selectedContent.id);
        if (error) throw error;
      } else {
        // Get the next order index
        const maxOrder = Math.max(...courseContent.map(c => c.order_index), -1);
        contentData.course_id = selectedCourse.id;
        contentData.order_index = maxOrder + 1;

        const { error } = await supabase
          .from("course_content")
          .insert([contentData]);
        if (error) throw error;
      }

      toast.success(selectedContent ? "Content updated successfully!" : "Content added successfully!");
      setIsEditingContent(false);
      setSelectedContent(null);
      resetContentForm();
      fetchCourseContent(selectedCourse.id);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("course_content")
        .delete()
        .eq("id", contentId);

      if (error) throw error;
      toast.success("Content deleted successfully!");
      if (selectedCourse) fetchCourseContent(selectedCourse.id);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      banner_image: "",
      technologies: "",
      price: "",
      is_free: true,
      status: "draft",
      duration_hours: "",
      difficulty_level: "beginner",
      rating: "",
      student_count: "",
    });
  };

  const resetContentForm = () => {
    setContentForm({
      title: "",
      description: "",
      content_type: "video",
      youtube_url: "",
      text_content: "",
      is_free: true,
      duration_minutes: "",
    });
  };

  const editCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      banner_image: course.banner_image || "",
      technologies: course.technologies.join(", "),
      price: course.price?.toString() || "",
      is_free: course.is_free,
      status: course.status,
      duration_hours: course.duration_hours?.toString() || "",
      difficulty_level: course.difficulty_level || "beginner",
      rating: course.rating?.toString() || "",
      student_count: course.student_count?.toString() || "",
    });
    setIsEditingCourse(true);
  };

  const editContent = (content: CourseContent) => {
    setSelectedContent(content);
    setContentForm({
      title: content.title,
      description: content.description || "",
      content_type: content.content_type,
      youtube_url: content.content_data?.youtube_url || "",
      text_content: content.content_data?.text_content || "",
      is_free: content.is_free,
      duration_minutes: content.duration_minutes?.toString() || "",
    });
    setIsEditingContent(true);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "text": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Management</h2>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses & Content</TabsTrigger>
          <TabsTrigger value="sections">Course Sections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
        <Dialog open={isEditingCourse} onOpenChange={setIsEditingCourse}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetCourseForm(); setSelectedCourse(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
              <DialogDescription>
                {selectedCourse ? "Update course details" : "Add a new course to your portfolio"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="banner">Banner Image URL</Label>
                <Input
                  id="banner"
                  value={courseForm.banner_image}
                  onChange={(e) => setCourseForm({ ...courseForm, banner_image: e.target.value })}
                  placeholder="Enter banner image URL"
                />
              </div>

              <div>
                <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                <Input
                  id="technologies"
                  value={courseForm.technologies}
                  onChange={(e) => setCourseForm({ ...courseForm, technologies: e.target.value })}
                  placeholder="React, Node.js, MongoDB, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={courseForm.difficulty_level}
                    onValueChange={(value) => setCourseForm({ ...courseForm, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={courseForm.is_free}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_free: checked })}
                />
                <Label htmlFor="is_free">Free Course</Label>
              </div>

              {!courseForm.is_free && (
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="49.99"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={courseForm.status}
                  onValueChange={(value) => setCourseForm({ ...courseForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Course Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={courseForm.rating}
                    onChange={(e) => setCourseForm({ ...courseForm, rating: e.target.value })}
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <Label htmlFor="student_count">Student Count</Label>
                  <Input
                    id="student_count"
                    type="number"
                    min="0"
                    value={courseForm.student_count}
                    onChange={(e) => setCourseForm({ ...courseForm, student_count: e.target.value })}
                    placeholder="150"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditingCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCourseSubmit}>
                  {selectedCourse ? "Update" : "Create"} Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage your course catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                        <Badge variant={course.is_free ? "outline" : "secondary"}>
                          {course.is_free ? "Free" : `$${course.price}`}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCourse(course);
                          fetchCourseContent(course.id);
                        }}
                      >
                        Content
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => editCourse(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        {selectedCourse && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCourse.title} - Content</CardTitle>
                  <CardDescription>Manage course content and lessons</CardDescription>
                </div>
                <Dialog open={isEditingContent} onOpenChange={setIsEditingContent}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { resetContentForm(); setSelectedContent(null); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedContent ? "Edit Content" : "Add New Content"}</DialogTitle>
                      <DialogDescription>
                        {selectedContent ? "Update content details" : "Add new lesson content"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="content-title">Title</Label>
                        <Input
                          id="content-title"
                          value={contentForm.title}
                          onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                          placeholder="Enter content title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="content-description">Description</Label>
                        <Textarea
                          id="content-description"
                          value={contentForm.description}
                          onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                          placeholder="Enter content description"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="content-type">Content Type</Label>
                          <Select
                            value={contentForm.content_type}
                            onValueChange={(value) => setContentForm({ ...contentForm, content_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={contentForm.duration_minutes}
                            onChange={(e) => setContentForm({ ...contentForm, duration_minutes: e.target.value })}
                            placeholder="15"
                          />
                        </div>
                      </div>

                      {contentForm.content_type === "video" && (
                        <div>
                          <Label htmlFor="youtube-url">
                            <Youtube className="w-4 h-4 inline mr-2" />
                            YouTube URL
                          </Label>
                          <Input
                            id="youtube-url"
                            value={contentForm.youtube_url}
                            onChange={(e) => setContentForm({ ...contentForm, youtube_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                      )}

                      {contentForm.content_type === "text" && (
                        <div>
                          <Label htmlFor="text-content">Text Content</Label>
                          <Textarea
                            id="text-content"
                            value={contentForm.text_content}
                            onChange={(e) => setContentForm({ ...contentForm, text_content: e.target.value })}
                            placeholder="Enter your lesson content here..."
                            rows={6}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="content-free"
                          checked={contentForm.is_free}
                          onCheckedChange={(checked) => setContentForm({ ...contentForm, is_free: checked })}
                        />
                        <Label htmlFor="content-free">Free Content</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditingContent(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleContentSubmit}>
                          {selectedContent ? "Update" : "Add"} Content
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courseContent.map((content, index) => (
                  <Card key={content.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {getContentIcon(content.content_type)}
                          <div>
                            <p className="font-medium text-sm">{content.title}</p>
                            {content.duration_minutes && (
                              <p className="text-xs text-muted-foreground">{content.duration_minutes}min</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {content.is_free ? (
                          <Unlock className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-600" />
                        )}
                        <Button size="sm" variant="outline" onClick={() => editContent(content)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteContent(content.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {courseContent.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No content added yet. Click "Add Content" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
        </TabsContent>
        
        <TabsContent value="sections">
          <CourseSectionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}