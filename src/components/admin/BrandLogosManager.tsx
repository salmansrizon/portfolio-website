import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createRepository } from "@/integrations/supabase/repository";
import { brandLogoConfig } from "@/adapters/entityConfigs";
import EntityFormDialog from "./EntityFormDialog";

// Create repository instance for brand logos
const brandLogoRepository = createRepository(brandLogoConfig);

const BrandLogosManager = () => {
  const { toast } = useToast();
  const [editingLogo, setEditingLogo] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use repository hooks
  const { data: logos = [], isLoading: loading } = brandLogoRepository.useFindAll();
  const { mutate: deleteLogo, isPending: isDeleting } = brandLogoRepository.useDelete();
  const { mutate: createLogo } = brandLogoRepository.useCreate();
  const { mutate: updateLogo } = brandLogoRepository.useUpdate();

  const handleSave = async () => {
    if (!form.name || !form.logo_url) {
      toast({ title: "Error", description: "Name and Logo URL are required", variant: "destructive" });
      return;
    }

    if (editingId) {
      const { error } = await supabase.from("brand_logos").update({
        name: form.name,
        logo_url: form.logo_url,
        website_url: form.website_url || null,
        hover_text: form.hover_text || null,
      }).eq("id", editingId);
      if (!error) toast({ title: "Updated", description: "Brand logo updated" });
    } else {
      const { error } = await supabase.from("brand_logos").insert({
        name: form.name,
        logo_url: form.logo_url,
        website_url: form.website_url || null,
        hover_text: form.hover_text || null,
        order_index: logos.length,
      });
      if (!error) toast({ title: "Added", description: "Brand logo added" });
    }

    setForm({ name: "", logo_url: "", website_url: "", hover_text: "" });
    setEditingId(null);
    fetchLogos();
  };

  const handleEdit = (logo: BrandLogo) => {
    setEditingId(logo.id);
    setForm({
      name: logo.name,
      logo_url: logo.logo_url,
      website_url: logo.website_url || "",
      hover_text: logo.hover_text || "",
    });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("brand_logos").delete().eq("id", id);
    toast({ title: "Deleted", description: "Brand logo removed" });
    fetchLogos();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("brand_logos").update({ is_visible: !current }).eq("id", id);
    fetchLogos();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Brand Logo" : "Add Brand Logo"}</CardTitle>
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
            <Button onClick={handleSave}>
              <Plus className="h-4 w-4 mr-1" /> {editingId ? "Update" : "Add"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => { setEditingId(null); setForm({ name: "", logo_url: "", website_url: "", hover_text: "" }); }}>
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
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(logo.id)}>
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
