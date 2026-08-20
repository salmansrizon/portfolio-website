import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, UserPlus, Mail, Phone, Globe, GraduationCap, Linkedin } from "lucide-react";
import { createRepository } from "@/integrations/supabase/repository";
import { instructorConfig, courseConfig } from "@/adapters/entityConfigs";
import { EntityFormDialog } from "./EntityFormDialog";
import ListPager from './ListPager';
import { useEntityManager } from "@/hooks/useEntityManager";

const courseRepository = createRepository(courseConfig);

export default function InstructorManager() {
  const { data: courses = [] } = courseRepository.useFindAll();
  const { items: instructors, pageItems, pagination, isLoading, openCreate, openEdit, remove, dialog } = useEntityManager(instructorConfig);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Instructor Management</h2>
          <p className="text-xs text-muted-foreground">Create and manage instructor profiles, assign courses</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <UserPlus className="w-4 h-4" />
          Add Instructor
        </Button>
      </div>

      <ListPager pagination={pagination} label="instructors" />


      <EntityFormDialog
        config={instructorConfig}
        {...dialog}
        dynamicOptions={{
          assigned_courses: courses.map(c => ({ label: c.title, value: c.id })),
        }}
      />

      {/* Instructor Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageItems.map(instructor => (
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
                  {instructor.linkedin_url && <div className="flex items-center gap-2 text-brand-linkedin font-bold"><Linkedin className="w-3.5 h-3.5" /><a href={instructor.linkedin_url} target="_blank" className="truncate hover:underline">LinkedIn Profile</a></div>}
                </div>
                {instructor.bio && <p className="text-xs text-muted-foreground line-clamp-2">{instructor.bio}</p>}
                <div className="flex items-center gap-1 flex-wrap">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">{instructor.assigned_courses?.length || 0} courses assigned</span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(instructor)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(instructor)}>
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
