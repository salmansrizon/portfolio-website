import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2, UserPlus, Mail, Phone, GraduationCap, BookOpen, Search, Users } from "lucide-react";
import { createRepository } from "@/integrations/supabase/repository";
import { studentConfig, courseConfig } from "@/adapters/entityConfigs";
import { EntityFormDialog } from "./EntityFormDialog";
import ListPager from './ListPager';
import { useEntityManager } from "@/hooks/useEntityManager";

const studentRepository = createRepository(studentConfig);
const courseRepository = createRepository(courseConfig);

export default function StudentManager() {
  const { data: courses = [] } = courseRepository.useFindAll();
  // Stats below need the full (unfiltered) count regardless of the search box —
  // shares the same query cache as useEntityManager's own useFindAll(), so this
  // isn't a second network request.
  const { data: allStudents = [] } = studentRepository.useFindAll();
  const {
    items: filteredStudents, pageItems, pagination,
    isLoading,
    search: searchQuery,
    setSearch: setSearchQuery,
    openCreate,
    openEdit,
    remove,
    dialog,
  } = useEntityManager(studentConfig);

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || "Unknown Course";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Student Management</h2>
          <p className="text-xs text-muted-foreground">Manage student profiles, enrollments, and access</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <UserPlus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      <ListPager pagination={pagination} label="students" />


      <EntityFormDialog
        config={studentConfig}
        {...dialog}
        dynamicOptions={{
          enrolled_courses: courses.map(c => ({ label: c.title, value: c.id })),
        }}
      />

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
          <CardContent className="py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{allStudents.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-soft flex items-center justify-center"><Users className="w-5 h-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{allStudents.filter(s => s.is_active).length}</p><p className="text-xs text-muted-foreground">Active</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-soft flex items-center justify-center"><BookOpen className="w-5 h-5 text-warning" /></div>
            <div><p className="text-2xl font-bold">{allStudents.reduce((acc, s) => acc + (s.enrolled_courses?.length || 0), 0)}</p><p className="text-xs text-muted-foreground">Enrollments</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-accent" /></div>
            <div><p className="text-2xl font-bold">{courses.length}</p><p className="text-xs text-muted-foreground">Courses</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageItems.map(student => (
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(student)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(student)}>
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
