import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { serviceConfig } from '@/adapters/entityConfigs';
import { EntityFormDialog } from './EntityFormDialog';
import ListPager from './ListPager';
import { useEntityManager } from '@/hooks/useEntityManager';

const ServicesManager = () => {
  const { items: services, pageItems, pagination, isLoading: loading, openCreate, openEdit, remove, dialog } = useEntityManager(serviceConfig);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Services</h3>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Service
        </Button>
      </div>

      <ListPager pagination={pagination} label="services" />


      <EntityFormDialog config={serviceConfig} {...dialog} />

      <div className="grid gap-3">
        {pageItems.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{service.title}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(service)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove(service)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;
