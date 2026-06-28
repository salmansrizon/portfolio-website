import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createRepository } from '@/integrations/supabase/repository';
import { certificationConfig } from '@/adapters/entityConfigs';
import EntityFormDialog from './EntityFormDialog';

// Create repository instance for certifications
const certificationRepository = createRepository(certificationConfig);

const CertificationsManager = () => {
  const [editingCert, setEditingCert] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use repository hooks
  const { data: certifications = [], isLoading: loading } = certificationRepository.useFindAll();
  const { mutate: deleteCertification, isPending: isDeleting } = certificationRepository.useDelete();
  const { mutate: createCertification } = certificationRepository.useCreate();
  const { mutate: updateCertification } = certificationRepository.useUpdate();

  const handleSave = (formData: any) => {
    if (editingCert) {
      updateCertification(
        { id: editingCert.id, item: formData },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Certification updated successfully!",
            });
            setIsDialogOpen(false);
            setEditingCert(null);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update certification",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createCertification(formData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Certification created successfully!",
          });
          setIsDialogOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create certification",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleEdit = (cert: any) => {
    setEditingCert(cert);
    setIsDialogOpen(true);
  };

  const handleDelete = (certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    deleteCertification(certId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Certification deleted successfully!",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete certification",
          variant: "destructive",
        });
      },
    });
  };

  const handleNewCertification = () => {
    setEditingCert(null);

    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button onClick={handleNewCert}>
          <Plus className="h-4 w-4 mr-2" />
          New Certification
        </Button>
      </div>

      <EntityFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        config={certificationConfig}
        editingItem={editingCert}
        onSave={handleSave}
        title="Certification"
      />

      <div className="grid gap-6">
        {certifications.map((cert: any) => (
          <Card key={cert.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{cert.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(cert)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(cert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Issuer: {cert.issuer}</p>
                  {cert.credential_id && (
                    <p className="text-sm text-muted-foreground">
                      Credential ID: {cert.credential_id}
                    </p>
                  )}
                  {cert.earned_date && (
                    <p className="text-sm text-muted-foreground">
                      Earned: {new Date(cert.earned_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CertificationsManager;