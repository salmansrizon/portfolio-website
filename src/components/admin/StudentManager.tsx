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
import { Plus, Edit, Trash2, UserPlus, Mail, Phone, GraduationCap, BookOpen, Search, Users } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  institution?: string;
  is_active: boolean;
  enrolled_courses?: string[];
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
  avatar_url: "",
  institution: "",
  is_active: true,
  enrolled_courses: [] as string[],
};

export default function StudentManager() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase.from("students" as any).select("*").order("created_at", { ascending: false }) as any);
      if (error) throw error;
      setStudents((data || []) as Student[]);
    } catch (error) {
      console.error("Error fetching students:", error);
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
        avatar_url: formData.avatar_url || null,
        institution: formData.institution || null,
        is_active: formData.is_active,
        enrolled_courses: formData.enrolled_courses,
      };

      if (editingStudent) {
        const { error } = await (supabase.from("students" as any).update(payload).eq("id", editingStudent.id) as any);
        if (error) throw error;
        toast({ title: "Success", description: "Student updated successfully." });
      } else {
        const { error } = await (supabase.from("students" as any).insert(payload) as any);
        if (error) throw error;
        toast({ title: "Success", description: "Student created successfully." });
      }

      setShowDialog(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save student.", variant: "destructive" });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      bio: student.bio || "",
      avatar_url: student.avatar_url || "",
      institution: student.institution || "",
      is_active: student.is_active,
      enrolled_courses: student.enrolled_courses || [],
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    try {
      const { error } = await (supabase.from("students" as any).delete().eq("id", id) as any);
      if (error) throw error;
      toast({ title: "Deleted", description: "Student removed successfully." });
      fetchStudents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData(initialFormData);
  };

  const toggleCourseEnrollment = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      enrolled_courses: prev.enrolled_courses.includes(courseId)
        ? prev.enrolled_courses.filter(id => id !== courseId)
        : [...prev.enrolled_courses, courseId]
    }));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || "Unknown Course";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-muted-foreground">Manage student profiles, enrollments, and access</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? `Edit: ${editingStudent.name}` : "Add New Student"}</DialogTitle>
              <DialogDescription>Fill in the student's details and enroll them in courses.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Student name" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+8801XXXXXXXXX" />
                </div>
                <div className="md:col-span-2">
                  <Label>Institution / Company</Label>
                  <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} placeholder="e.g., BUET, University of Dhaka" />
                </div>
                <div className="md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} placeholder="https://example.com/avatar.jpg" />
                </div>
                <div className="md:col-span-2">
                  <Label>Notes / Bio</Label>
                  <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Any notes about the student..." rows={2} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Active Student</Label>
                </div>
              </div>

              {/* Course Enrollment */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Enroll in Courses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {courses.map(course => (
                    <label key={course.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.enrolled_courses.includes(course.id) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted'}`}>
                      <input
                        type="checkbox"
                        checked={formData.enrolled_courses.includes(course.id)}
                        onChange={() => toggleCourseEnrollment(course.id)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium truncate">{course.title}</span>
                    </label>
                  ))}
                  {courses.length === 0 && <p className="text-sm text-muted-foreground col-span-2">No courses available.</p>}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{students.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-soft dark:bg-success/10 flex items-center justify-center"><Users className="w-5 h-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{students.filter(s => s.is_active).length}</p><p className="text-xs text-muted-foreground">Active</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-soft dark:bg-warning/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-warning" /></div>
            <div><p className="text-2xl font-bold">{students.reduce((acc, s) => acc + (s.enrolled_courses?.length || 0), 0)}</p><p className="text-xs text-muted-foreground">Enrollments</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{courses.length}</p><p className="text-xs text-muted-foreground">Courses</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-56 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No students found" : "No Students Yet"}</h3>
            <p className="text-muted-foreground mb-4">{searchQuery ? "Try a different search term." : "Add your first student to get started."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <Card key={student.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base overflow-hidden shrink-0">
                      {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{student.name}</CardTitle>
                      {student.institution && <CardDescription className="text-xs">{student.institution}</CardDescription>}
                    </div>
                  </div>
                  <Badge variant={student.is_active ? "default" : "secondary"} className="text-[10px]">
                    {student.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{student.email}</div>
                  {student.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{student.phone}</div>}
                </div>

                {/* Enrolled Courses */}
                {(student.enrolled_courses?.length || 0) > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">Enrolled Courses:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.enrolled_courses!.slice(0, 3).map(courseId => (
                        <Badge key={courseId} variant="secondary" className="text-[10px] py-0">
                          {getCourseName(courseId)}
                        </Badge>
                      ))}
                      {student.enrolled_courses!.length > 3 && (
                        <Badge variant="outline" className="text-[10px] py-0">+{student.enrolled_courses!.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(student)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(student.id)}>
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
