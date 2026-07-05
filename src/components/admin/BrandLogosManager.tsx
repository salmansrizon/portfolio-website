import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdminResource } from "@/hooks/useAdminResource";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";

interface BrandLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  hover_text: string | null;
  order_index: number;
  is_visible: boolean;
}

const BrandLogosManager = () => {
  const { toast } = useToast();
  const resource = useAdminResource<BrandLogo>({
    table: "brand_logos",
    orderBy: { column: "order_index", ascending: true },
  });
  const { items: logos, loading, saving, editingItem, startCreate, startEdit, save, remove, refresh } = resource;
  const [form, setForm] = useState({ name: "", logo_url: "", website_url: "", hover_text: "" });

  const handleSave = async () => {
    if (!form.name || !form.logo_url) {
      toast({ title: "Error", description: "Name and Logo URL are required", variant: "destructive" });
      return;
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      logo_url: form.logo_url,
      website_url: form.website_url || null,
      hover_text: form.hover_text || null,
    };
    if (!editingItem) payload.order_index = logos.length;

    const ok = await save(payload);
    if (ok) setForm({ name: "", logo_url: "", website_url: "", hover_text: "" });
  };

  const handleEdit = (logo: BrandLogo) => {
    startEdit(logo);
    setForm({
      name: logo.name,
      logo_url: logo.logo_url,
      website_url: logo.website_url || "",
      hover_text: logo.hover_text || "",
    });
  };

  const handleCancelEdit = () => {
    startCreate();
    setForm({ name: "", logo_url: "", website_url: "", hover_text: "" });
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("brand_logos").update({ is_visible: !current }).eq("id", id);
    refresh();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? "Edit Brand Logo" : "Add Brand Logo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Brand Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Google" />
            </div>
            <div>
              <Label>Logo URL *</Label>
              <Input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Website URL</Label>
              <Input value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Hover Text</Label>
              <Input value={form.hover_text} onChange={e => setForm({ ...form, hover_text: e.target.value })} placeholder="Visit website" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Plus className="h-4 w-4 mr-1" /> {editingItem ? "Update" : "Add"}
            </Button>
            {editingItem && (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Logos ({logos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No brand logos added yet</p>
          ) : (
            <div className="space-y-3">
              {logos.map(logo => (
                <div key={logo.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <img src={logo.logo_url} alt={logo.name} className="h-8 w-auto object-contain max-w-[100px]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{logo.name}</p>
                    {logo.website_url && (
                      <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                        {logo.website_url} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <Switch checked={logo.is_visible} onCheckedChange={() => toggleVisibility(logo.id, logo.is_visible)} />
                  <Button variant="outline" size="sm" onClick={() => handleEdit(logo)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(logo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandLogosManager;
