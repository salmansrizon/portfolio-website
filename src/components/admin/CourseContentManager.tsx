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
import { Plus, Edit, Trash2, ChevronRight, Folder, FileText, HelpCircle, Code, Video } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  course_id: string;
  is_visible: boolean;
}

interface SubModule {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  module_id: string;
  is_visible: boolean;
}

interface Content {
  id: string;
  title: string;
  description?: string;
  content_category: 'lesson' | 'quiz' | 'project' | 'assignment' | 'text' | 'video';
  order_index: number;
  module_id?: string;
  submodule_id?: string;
  is_free: boolean;
  duration_minutes?: number;
}

const CONTENT_TYPES = [
  { value: "lesson", label: "Lesson", icon: Video },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "project", label: "Project", icon: Code },
  { value: "assignment", label: "Assignment", icon: FileText },
];

export default function CourseContentManager() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showSubModuleDialog, setShowSubModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingSubModule, setEditingSubModule] = useState<SubModule | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedSubModule, setSelectedSubModule] = useState<string>("");
  
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_visible: true,
  });

  const [subModuleForm, setSubModuleForm] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_visible: true,
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content_category: "lesson" as Content['content_category'],
    order_index: 0,
    is_free: false,
    duration_minutes: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      fetchSubModules();
      fetchContents();
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedSubModule) {
      fetchContents();
    }
  }, [selectedSubModule]);

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

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", selectedCourse)
        .order("order_index");

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      });
    }
  };

  const fetchSubModules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_submodules")
        .select("*")
        .eq("module_id", selectedModule)
        .order("order_index");

      if (error) throw error;
      setSubModules(data || []);
    } catch (error) {
      console.error("Error fetching submodules:", error);
      toast({
        title: "Error",
        description: "Failed to load submodules",
        variant: "destructive",
      });
    }
  };

  const fetchContents = async () => {
    try {
      let query = supabase
        .from("course_content")
        .select("*")
        .order("order_index");

      if (selectedSubModule) {
        query = query.eq("submodule_id", selectedSubModule);
      } else if (selectedModule) {
        query = query.eq("module_id", selectedModule).is("submodule_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error("Error fetching contents:", error);
      toast({
        title: "Error",
        description: "Failed to load contents",
        variant: "destructive",
      });
    }
  };

  const handleModuleSubmit = async () => {
    try {
      const moduleData = {
        ...moduleForm,
        course_id: selectedCourse,
      };

      if (editingModule) {
        const { error } = await supabase
          .from("course_modules")
          .update(moduleData)
          .eq("id", editingModule.id);

        if (error) throw error;
        toast({ title: "Success", description: "Module updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_modules")
          .insert(moduleData);

        if (error) throw error;
        toast({ title: "Success", description: "Module created successfully" });
      }

      resetModuleForm();
      fetchModules();
      setShowModuleDialog(false);
    } catch (error) {
      console.error("Error saving module:", error);
      toast({
        title: "Error",
        description: "Failed to save module",
        variant: "destructive",
      });
    }
  };

  const handleSubModuleSubmit = async () => {
    try {
      const subModuleData = {
        ...subModuleForm,
        module_id: selectedModule,
      };

      if (editingSubModule) {
        const { error } = await supabase
          .from("course_submodules")
          .update(subModuleData)
          .eq("id", editingSubModule.id);

        if (error) throw error;
        toast({ title: "Success", description: "SubModule updated successfully" });
      } else {
        const { error } = await supabase
          .from("course_submodules")
          .insert(subModuleData);

        if (error) throw error;
        toast({ title: "Success", description: "SubModule created successfully" });
      }

      resetSubModuleForm();
      fetchSubModules();
      setShowSubModuleDialog(false);
    } catch (error) {
      console.error("Error saving submodule:", error);
      toast({
        title: "Error",
        description: "Failed to save submodule",
        variant: "destructive",
      });
    }
  };

  const handleContentSubmit = async () => {
    try {
      const contentData = {
        ...contentForm,
        course_id: selectedCourse,
        module_id: selectedModule || null,
        submodule_id: selectedSubModule || null,
        content_data: {},
        content_type: "text",
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

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Module deleted successfully" });
      fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleForm({
      title: "",
      description: "",
      order_index: modules.length,
      is_visible: true,
    });
  };

  const resetSubModuleForm = () => {
    setEditingSubModule(null);
    setSubModuleForm({
      title: "",
      description: "",
      order_index: subModules.length,
      is_visible: true,
    });
  };

  const resetContentForm = () => {
    setEditingContent(null);
    setContentForm({
      title: "",
      description: "",
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
        <>
          {/* Modules Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Modules
                </CardTitle>
                <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetModuleForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingModule ? "Edit Module" : "Add New Module"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="module_title">Title</Label>
                        <Input
                          id="module_title"
                          value={moduleForm.title}
                          onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="module_description">Description</Label>
                        <Textarea
                          id="module_description"
                          value={moduleForm.description}
                          onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="module_order">Order Index</Label>
                          <Input
                            id="module_order"
                            type="number"
                            value={moduleForm.order_index}
                            onChange={(e) => setModuleForm({ ...moduleForm, order_index: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="module_visible"
                            checked={moduleForm.is_visible}
                            onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_visible: checked })}
                          />
                          <Label htmlFor="module_visible">Visible</Label>
                        </div>
                      </div>
                      <Button onClick={handleModuleSubmit} className="w-full">
                        {editingModule ? "Update Module" : "Create Module"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModule === module.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedModule(selectedModule === module.id ? "" : module.id)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedModule === module.id ? 'rotate-90' : ''}`} />
                      <Folder className="w-4 h-4" />
                      <div>
                        <span className="font-medium">{module.title}</span>
                        {!module.is_visible && <Badge variant="secondary" className="ml-2">Hidden</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModule(module);
                          setModuleForm({
                            title: module.title,
                            description: module.description || "",
                            order_index: module.order_index,
                            is_visible: module.is_visible,
                          });
                          setShowModuleDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteModule(module.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SubModules and Content */}
          {selectedModule && (
            <div className="ml-6 space-y-4">
              {/* SubModules Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      SubModules
                    </CardTitle>
                    <Dialog open={showSubModuleDialog} onOpenChange={setShowSubModuleDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={resetSubModuleForm}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add SubModule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingSubModule ? "Edit SubModule" : "Add New SubModule"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="submodule_title">Title</Label>
                            <Input
                              id="submodule_title"
                              value={subModuleForm.title}
                              onChange={(e) => setSubModuleForm({ ...subModuleForm, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="submodule_description">Description</Label>
                            <Textarea
                              id="submodule_description"
                              value={subModuleForm.description}
                              onChange={(e) => setSubModuleForm({ ...subModuleForm, description: e.target.value })}
                            />
                          </div>
                          <Button onClick={handleSubModuleSubmit} className="w-full">
                            {editingSubModule ? "Update SubModule" : "Create SubModule"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subModules.map((subModule) => (
                      <div
                        key={subModule.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSubModule === subModule.id ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedSubModule(selectedSubModule === subModule.id ? "" : subModule.id)}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedSubModule === subModule.id ? 'rotate-90' : ''}`} />
                          <span className="font-medium">{subModule.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Content
                      {selectedSubModule && <span className="text-sm text-muted-foreground">(in selected submodule)</span>}
                    </CardTitle>
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
                            <Select value={contentForm.content_category} onValueChange={(value: Content['content_category']) => setContentForm({ ...contentForm, content_category: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CONTENT_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
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
                                onChange={(e) => setContentForm({ ...contentForm, duration_minutes: parseInt(e.target.value) })}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is_free"
                                checked={contentForm.is_free}
                                onCheckedChange={(checked) => setContentForm({ ...contentForm, is_free: checked })}
                              />
                              <Label htmlFor="is_free">Free</Label>
                            </div>
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
                      <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getContentIcon(content.content_category)}
                          <div>
                            <span className="font-medium">{content.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{content.content_category}</Badge>
                              {content.is_free && <Badge variant="secondary">Free</Badge>}
                              {content.duration_minutes && (
                                <span className="text-sm text-muted-foreground">{content.duration_minutes} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}