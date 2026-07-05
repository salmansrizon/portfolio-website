import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useAdminResource } from '@/hooks/useAdminResource';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  credential_id?: string;
  verification_url?: string;
  image_url?: string;
  earned_date?: string;
  created_at: string;
}

const CertificationsManager = () => {
  const {
    items: certifications,
    loading,
    saving,
    editingItem: editingCert,
    isDialogOpen,
    setIsDialogOpen,
    startCreate,
    startEdit,
    save,
    remove,
  } = useAdminResource<Certification>({ table: 'certifications', orderBy: { column: 'earned_date', ascending: false } });
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (formData: any) => {
    const certData = {
      title: formData.title,
      issuer: formData.issuer,
      credential_id: formData.credential_id || null,
      verification_url: formData.verification_url || null,
      image_url: formData.image_url || null,
      earned_date: formData.earned_date || null
    };
    const ok = await save(certData);
    if (ok) reset();
  };

  const handleEdit = (cert: Certification) => {
    startEdit(cert);
    setValue('title', cert.title);
    setValue('issuer', cert.issuer);
    setValue('credential_id', cert.credential_id || '');
    setValue('verification_url', cert.verification_url || '');
    setValue('image_url', cert.image_url || '');
    setValue('earned_date', cert.earned_date || '');
  };

  const handleDelete = (certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    remove(certId);
  };

  const handleNewCertification = () => {
    startCreate();
    reset();
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCertification}>
              <Plus className="h-4 w-4 mr-2" />
              New Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCert ? 'Edit Certification' : 'Create New Certification'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder="Certification title"
                />
              </div>

              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  {...register('issuer', { required: true })}
                  placeholder="e.g., Microsoft, Google, AWS"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credential_id">Credential ID</Label>
                  <Input
                    id="credential_id"
                    {...register('credential_id')}
                    placeholder="e.g., DP-203, AZ-900"
                  />
                </div>

                <div>
                  <Label htmlFor="earned_date">Earned Date</Label>
                  <Input
                    id="earned_date"
                    type="date"
                    {...register('earned_date')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="verification_url">Verification URL</Label>
                <Input
                  id="verification_url"
                  type="url"
                  {...register('verification_url')}
                  placeholder="https://learn.microsoft.com/..."
                />
              </div>

              <div>
                <Label htmlFor="image_url">Badge Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  {...register('image_url')}
                  placeholder="https://example.com/badge.png"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingCert ? 'Update' : 'Create'} Certification
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {certifications.map((cert) => (
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
                  {cert.verification_url && (
                    <a
                      href={cert.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      Verify Certification
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
                {cert.image_url && (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-16 h-16 object-contain"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CertificationsManager;
