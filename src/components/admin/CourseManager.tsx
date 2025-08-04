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
import { Plus, Edit, Trash2, X } from "lucide-react";

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
  student_count?: number;
  rating?: number;
}

const formData = {
  title: "",
  description: "",
  price: null,
  discounted_price: null,
  discount_percentage: null,
  is_free: false,
  status: "draft",
  difficulty_level: "",
  duration_hours: null,
  banner_image: "",
  technologies: [],
  student_count: 0,
  rating: 0,
};

export default function CourseManager() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [currentFormData, setFormData] = useState(formData);
  const [newTechnology, setNewTechnology] = useState("");

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
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(currentFormData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        const { error } = await supabase
          .from("courses")
          .insert(currentFormData);

        if (error) throw error;
        toast({ title: "Success", description: "Course created successfully" });
      }

      resetForm();
      fetchCourses();
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData(formData);
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !currentFormData.technologies.includes(newTechnology.trim())) {
      setFormData({
        ...currentFormData,
        technologies: [...currentFormData.technologies, newTechnology.trim()]
      });
      setNewTechnology("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...currentFormData,
      technologies: currentFormData.technologies.filter(t => t !== tech)
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
                  value={currentFormData.title}
                  onChange={(e) => setFormData({ ...currentFormData, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentFormData.description}
                  onChange={(e) => setFormData({ ...currentFormData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (৳)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={currentFormData.price || ''}
                    onChange={(e) => setFormData({ ...currentFormData, price: parseFloat(e.target.value) || null })}
                    placeholder="Course price"
                  />
                </div>
                <div>
                  <Label htmlFor="discounted_price">Discounted Price (৳)</Label>
                  <Input
                    id="discounted_price"
                    type="number"
                    step="0.01"
                    value={currentFormData.discounted_price || ''}
                    onChange={(e) => setFormData({ ...currentFormData, discounted_price: parseFloat(e.target.value) || null })}
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
                    value={currentFormData.discount_percentage || ''}
                    onChange={(e) => setFormData({ ...currentFormData, discount_percentage: parseInt(e.target.value) || null })}
                    placeholder="Discount percentage"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="banner_image">Banner Image URL</Label>
                <Input
                  id="banner_image"
                  value={currentFormData.banner_image}
                  onChange={(e) => setFormData({ ...currentFormData, banner_image: e.target.value })}
                  placeholder="Image URL"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select 
                    value={currentFormData.difficulty_level} 
                    onValueChange={(value) => setFormData({ ...currentFormData, difficulty_level: value })}
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
                    value={currentFormData.duration_hours || ''}
                    onChange={(e) => setFormData({ ...currentFormData, duration_hours: parseInt(e.target.value) || null })}
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
                  {currentFormData.technologies.map((tech, index) => (
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
                  checked={currentFormData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...currentFormData, is_free: checked })}
                />
                <Label htmlFor="is_free">Free Course</Label>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={currentFormData.status} 
                  onValueChange={(value) => setFormData({ ...currentFormData, status: value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                    {course.is_free && <Badge variant="outline">Free</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCourse(course);
                      setFormData({
                        title: course.title,
                        description: course.description,
                        price: course.price || null,
                        discounted_price: course.discounted_price || null,
                        discount_percentage: course.discount_percentage || null,
                        is_free: course.is_free,
                        status: course.status,
                        difficulty_level: course.difficulty_level || "",
                        duration_hours: course.duration_hours || null,
                        banner_image: course.banner_image || "",
                        technologies: course.technologies || [],
                        student_count: course.student_count || 0,
                        rating: course.rating || 0,
                      });
                      setShowDialog(true);
                    }}
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
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {course.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>
                    {course.is_free ? 'Free' : course.discounted_price ? (
                      <span>
                        ৳{course.discounted_price} 
                        <span className="line-through text-muted-foreground ml-1">৳{course.price}</span>
                      </span>
                    ) : `৳${course.price}`}
                  </span>
                </div>
                {course.duration_hours && (
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{course.duration_hours}h</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span>{course.student_count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}