import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, X, UserPlus, Mail, Phone, Globe, GraduationCap, Linkedin } from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  avatar_url?: string;
  website?: string;
  linkedin_url?: string;
  is_active: boolean;
  assigned_courses?: string[];
  created_at?: string;
}

interface Course {
  id: string;
  title: string;
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  specialization: "",
  avatar_url: "",
  website: "",
  linkedin_url: "",
  is_active: true,
  assigned_courses: [] as string[],
};

export default function InstructorManager() {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstructors();
    fetchCourses();
  }, []);

  const fetchInstructors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase.from("instructors" as any).select("*").order("created_at", { ascending: false }) as any);
      if (error) throw error;
      setInstructors((data || []) as Instructor[]);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await supabase.from("courses").select("id, title").order("title");
      setCourses((data || []) as Course[]);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        bio: formData.bio || null,
        specialization: formData.specialization || null,
        avatar_url: formData.avatar_url || null,
        website: formData.website || null,
        linkedin_url: formData.linkedin_url || null,
        is_active: formData.is_active,
        assigned_courses: formData.assigned_courses,
      };

      if (editingInstructor) {
        const { error } = await (supabase.from("instructors" as any).update(payload).eq("id", editingInstructor.id) as any);
        if (error) throw error;
        toast({ title: "Success", description: "Instructor updated successfully." });
      } else {
        const { error } = await (supabase.from("instructors" as any).insert(payload) as any);
        if (error) throw error;
        toast({ title: "Success", description: "Instructor created successfully." });
      }

      setShowDialog(false);
      resetForm();
      fetchInstructors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save instructor.", variant: "destructive" });
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone || "",
      bio: instructor.bio || "",
      specialization: instructor.specialization || "",
      avatar_url: instructor.avatar_url || "",
      website: instructor.website || "",
      linkedin_url: instructor.linkedin_url || "",
      is_active: instructor.is_active,
      assigned_courses: instructor.assigned_courses || [],
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instructor?")) return;
    try {
      const { error } = await (supabase.from("instructors" as any).delete().eq("id", id) as any);
      if (error) throw error;
      toast({ title: "Deleted", description: "Instructor removed successfully." });
      fetchInstructors();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingInstructor(null);
    setFormData(initialFormData);
  };

  const toggleCourseAssignment = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_courses: prev.assigned_courses.includes(courseId)
        ? prev.assigned_courses.filter(id => id !== courseId)
        : [...prev.assigned_courses, courseId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Instructor Management</h2>
          <p className="text-muted-foreground">Create and manage instructor profiles, assign courses</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInstructor ? `Edit: ${editingInstructor.name}` : "Add New Instructor"}</DialogTitle>
              <DialogDescription>Fill in the instructor's profile details and assign courses.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Dr. Jane Smith" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="instructor@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+8801XXXXXXXXX" />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g., Data Science, Web Development" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
                </div>
                <div className="md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} placeholder="https://example.com/avatar.jpg" />
                </div>
                <div className="md:col-span-2">
                  <Label>LinkedIn Profile URL</Label>
                  <Input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Brief introduction about the instructor..." rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Active Instructor</Label>
                </div>
              </div>

              {/* Course Assignment */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Assign Courses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {courses.map(course => (
                    <label key={course.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.assigned_courses.includes(course.id) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted'}`}>
                      <input
                        type="checkbox"
                        checked={formData.assigned_courses.includes(course.id)}
                        onChange={() => toggleCourseAssignment(course.id)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium truncate">{course.title}</span>
                    </label>
                  ))}
                  {courses.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No courses available. Create courses first.</p>}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingInstructor ? "Update Instructor" : "Create Instructor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Instructor Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : instructors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Instructors Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first instructor profile to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map(instructor => (
            <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden shrink-0">
                      {instructor.avatar_url ? (
                        <img src={instructor.avatar_url} alt={instructor.name} className="w-full h-full object-cover" />
                      ) : (
                        instructor.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{instructor.name}</CardTitle>
                      <CardDescription className="text-xs">{instructor.specialization || "General"}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={instructor.is_active ? "default" : "secondary"} className="text-[10px]">
                    {instructor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{instructor.email}</div>
                  {instructor.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{instructor.phone}</div>}
                  {instructor.website && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /><a href={instructor.website} target="_blank" className="text-primary hover:underline truncate">{instructor.website}</a></div>}
                  {instructor.linkedin_url && <div className="flex items-center gap-2 text-[#0077b5] font-bold"><Linkedin className="w-3.5 h-3.5" /><a href={instructor.linkedin_url} target="_blank" className="truncate hover:underline">LinkedIn Profile</a></div>}
                </div>
                {instructor.bio && <p className="text-xs text-muted-foreground line-clamp-2">{instructor.bio}</p>}
                <div className="flex items-center gap-1 flex-wrap">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">{instructor.assigned_courses?.length || 0} courses assigned</span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(instructor)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(instructor.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
