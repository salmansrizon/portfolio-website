import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CourseEnrollmentManager() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      // Fetch enrollments and courses separately to avoid FK join RLS issues
      const [enrollRes, coursesRes] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("courses")
          .select("id, title, is_free, price, discounted_price"),
      ]);

      if (enrollRes.error) throw enrollRes.error;

      const coursesMap = new Map(
        (coursesRes.data || []).map((c: any) => [c.id, c])
      );

      const merged = (enrollRes.data || []).map((e: any) => ({
        ...e,
        course: coursesMap.get(e.course_id) || null,
      }));

      setEnrollments(merged);
    } catch (error: any) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load enrollments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Enrollment status updated to ${newStatus}.`,
      });
      fetchEnrollments();
    } catch (error: any) {
      console.error("Error updating enrollment:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update enrollment status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this enrollment?")) return;
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Enrollment deleted successfully." });
      fetchEnrollments();
    } catch (error: any) {
      console.error("Error deleting enrollment:", error);
      toast({ title: "Error", description: error?.message || "Failed to delete enrollment.", variant: "destructive" });
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Enrollments</h2>
          <p className="text-muted-foreground text-sm">Review, approve, or reject student enrollments.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enrollments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment / Txn ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading enrollments...
                </TableCell>
              </TableRow>
            ) : filteredEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No enrollments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEnrollments.map((enr) => (
                <TableRow key={enr.id}>
                  <TableCell>
                    <div className="font-semibold">{enr.user_name}</div>
                    <div className="text-xs text-muted-foreground">{enr.user_email}</div>
                    <div className="text-xs text-muted-foreground">{enr.whatsapp_number}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-[200px] truncate" title={enr.course?.title}>
                      {enr.course?.title || "Unknown Course"}
                    </div>
                    {enr.course?.is_free ? (
                      <Badge variant="outline" className="text-xs mt-1">Free</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1 block">Paid</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(enr.created_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    {enr.course?.is_free ? (
                      <span className="text-muted-foreground text-sm italic">Not applicable</span>
                    ) : (
                      <>
                        <div className="capitalize font-medium text-sm">{enr.payment_method || "N/A"}</div>
                        {enr.transaction_id && (
                          <div className="font-mono text-xs mt-1 bg-muted px-1.5 py-0.5 rounded w-fit">
                            {enr.transaction_id}
                          </div>
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      enr.status === 'confirmed' || enr.status === 'approved' ? 'default' : 
                      enr.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {enr.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(!enr.status || enr.status === 'pending' || enr.status === 'active') && (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-success border-success-soft hover:bg-success-soft" onClick={() => handleUpdateStatus(enr.id, 'confirmed')} title="Approve">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-danger border-danger-soft hover:bg-danger-soft" onClick={() => handleUpdateStatus(enr.id, 'rejected')} title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleDelete(enr.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
