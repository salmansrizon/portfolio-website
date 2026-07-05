import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminResource } from "@/hooks/useAdminResource";
import { Plus, Edit, Trash2, Tag, Percent, Coins } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  scope: "all" | "course" | "webinar";
  course_id?: string | null;
  webinar_id?: string | null;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  valid_until?: string | null;
  created_at?: string;
}

interface Option {
  id: string;
  title: string;
}

const initialFormData = {
  code: "",
  description: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  scope: "all" as "all" | "course" | "webinar",
  course_id: "",
  webinar_id: "",
  max_uses: "",
  is_active: true,
  valid_until: "",
};

export default function PromoCodeManager() {
  const { toast } = useToast();
  const {
    items: promoCodes,
    loading: isLoading,
    editingItem: editingCode,
    isDialogOpen: showDialog,
    setIsDialogOpen: setShowDialog,
    startEdit,
    clearEditing,
    save,
    remove,
  } = useAdminResource<PromoCode>({ table: "promo_codes", orderBy: { column: "created_at", ascending: false } });
  const [courses, setCourses] = useState<Option[]>([]);
  const [webinars, setWebinars] = useState<Option[]>([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchCourses();
    fetchWebinars();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, title").order("title");
    setCourses((data || []) as Option[]);
  };

  const fetchWebinars = async () => {
    const { data } = await (supabase.from("webinars" as any).select("id, title").order("title") as any);
    setWebinars((data || []) as Option[]);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.discount_value) {
      toast({ title: "Error", description: "Code and discount value are required.", variant: "destructive" });
      return;
    }

    const payload: Record<string, unknown> = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      scope: formData.scope,
      course_id: formData.scope === "course" ? formData.course_id || null : null,
      webinar_id: formData.scope === "webinar" ? formData.webinar_id || null : null,
      max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      is_active: formData.is_active,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
    };

    const ok = await save(payload);
    if (ok) setFormData(initialFormData);
  };

  const handleEdit = (code: PromoCode) => {
    startEdit(code);
    setFormData({
      code: code.code,
      description: code.description || "",
      discount_type: code.discount_type,
      discount_value: String(code.discount_value),
      scope: code.scope,
      course_id: code.course_id || "",
      webinar_id: code.webinar_id || "",
      max_uses: code.max_uses != null ? String(code.max_uses) : "",
      is_active: code.is_active,
      valid_until: code.valid_until ? code.valid_until.slice(0, 10) : "",
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    remove(id);
  };

  const resetForm = () => {
    clearEditing();
    setFormData(initialFormData);
  };

  const scopeLabel = (code: PromoCode) => {
    if (code.scope === "course") return courses.find(c => c.id === code.course_id)?.title || "Course (deleted)";
    if (code.scope === "webinar") return webinars.find(w => w.id === code.webinar_id)?.title || "Webinar (deleted)";
    return "All courses & webinars";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promo Codes</h2>
          <p className="text-muted-foreground">Create and manage discount codes for enrollment/registration checkout</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCode ? `Edit: ${editingCode.code}` : "Add New Promo Code"}</DialogTitle>
              <DialogDescription>Codes are matched case-insensitively and stored uppercase.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Code *</Label>
                <Input
                  className="uppercase font-mono"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., LAUNCH20"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal note about this code"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={formData.discount_type} onValueChange={(v: "percentage" | "fixed") => setFormData({ ...formData, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 500"}
                  />
                </div>
              </div>

              <div>
                <Label>Applies To</Label>
                <Select value={formData.scope} onValueChange={(v: "all" | "course" | "webinar") => setFormData({ ...formData, scope: v, course_id: "", webinar_id: "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courses & webinars</SelectItem>
                    <SelectItem value="course">Specific course</SelectItem>
                    <SelectItem value="webinar">Specific webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.scope === "course" && (
                <div>
                  <Label>Course</Label>
                  <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.scope === "webinar" && (
                <div>
                  <Label>Webinar</Label>
                  <Select value={formData.webinar_id} onValueChange={(v) => setFormData({ ...formData, webinar_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a webinar" /></SelectTrigger>
                    <SelectContent>
                      {webinars.map(w => <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label>Expires On</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Active</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingCode ? "Update Promo Code" : "Create Promo Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : promoCodes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Promo Codes Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first promo code to offer discounts at checkout.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoCodes.map(code => (
            <Card key={code.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {code.discount_type === "percentage" ? <Percent className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-mono">{code.code}</CardTitle>
                      <CardDescription className="text-xs">
                        {code.discount_type === "percentage" ? `${code.discount_value}% off` : `৳${code.discount_value} off`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={code.is_active ? "default" : "secondary"} className="text-[10px]">
                    {code.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {code.description && <p className="text-xs text-muted-foreground line-clamp-2">{code.description}</p>}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Applies to: <span className="font-medium text-foreground">{scopeLabel(code)}</span></div>
                  <div>Used: <span className="font-medium text-foreground">{code.used_count}{code.max_uses != null ? ` / ${code.max_uses}` : ""}</span></div>
                  {code.valid_until && <div>Expires: <span className="font-medium text-foreground">{new Date(code.valid_until).toLocaleDateString()}</span></div>}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(code)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(code.id)}>
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
