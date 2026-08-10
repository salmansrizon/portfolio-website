import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { brandLogoConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import { useEntityManager } from '@/hooks/useEntityManager';

const BrandLogosManager = () => {
  const { items: logos, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(brandLogoConfig);

  // order_index should only be stamped when creating — an edit shouldn't
  // silently re-append the logo to the end of the list.
  const handleSubmit = (data: any) => {
    dialog.onSubmit(dialog.initialData ? data : { ...data, order_index: logos.length });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Brand Logos</h3>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Logo
        </Button>
      </div>

      <EntityFormDialog
        config={brandLogoConfig}
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        initialData={dialog.initialData}
        onSubmit={handleSubmit}
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
                  <Button variant="outline" size="sm" onClick={() => openEdit(logo)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(logo)}>
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
