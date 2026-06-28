import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { createRepository } from "@/integrations/supabase/repository";
import { brandLogoConfig } from "@/adapters/entityConfigs";
import EntityFormDialog from "./EntityFormDialog";

const brandLogoRepository = createRepository(brandLogoConfig);

const BrandLogosManager = () => {
  const { toast } = useToast();
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: logos = [], isLoading: loading } = brandLogoRepository.useFindAll();
  const { mutate: deleteLogo } = brandLogoRepository.useDelete();
  const { mutate: createLogo } = brandLogoRepository.useCreate();
  const { mutate: updateLogo } = brandLogoRepository.useUpdate();

  const handleSave = (formData: any) => {
    if (editingLogo) {
      updateLogo(
        { id: editingLogo.id, item: formData },
        {
          onSuccess: () => {
            toast({ title: "Updated", description: "Brand logo updated" });
            setIsDialogOpen(false);
            setEditingLogo(null);
          },
          onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
        }
      );
    } else {
      createLogo(
        { ...formData, order_index: logos.length },
        {
          onSuccess: () => {
            toast({ title: "Added", description: "Brand logo added" });
            setIsDialogOpen(false);
          },
          onError: () => toast({ title: "Error", description: "Failed to add", variant: "destructive" }),
        }
      );
    }
  };

  const handleEdit = (logo: any) => {
    setEditingLogo(logo);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this brand logo?")) return;
    deleteLogo(id, {
      onSuccess: () => toast({ title: "Deleted", description: "Brand logo removed" }),
      onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Brand Logos</h3>
        <Button onClick={() => { setEditingLogo(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Logo
        </Button>
      </div>

      <EntityFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        config={brandLogoConfig}
        editingItem={editingLogo}
        onSave={handleSave}
        title="Brand Logo"
      />

      <Card>
        <CardHeader>
          <CardTitle>Brand Logos ({logos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No brand logos added yet</p>
          ) : (
            <div className="space-y-3">
              {logos.map((logo: any) => (
                <div key={logo.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  {logo.logo_url && <img src={logo.logo_url} alt={logo.name} className="h-8 w-auto object-contain max-w-[100px]" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{logo.name}</p>
                  </div>
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
