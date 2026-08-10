import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { certificationConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import { useEntityManager } from '@/hooks/useEntityManager';

const CertificationsManager = () => {
  const { items: certifications, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(certificationConfig);

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
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Certification
        </Button>
      </div>

      <EntityFormDialog config={certificationConfig} {...dialog} />

      <div className="grid gap-6">
        {certifications.map((cert: any) => (
          <Card key={cert.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{cert.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(cert)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove(cert)}
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
