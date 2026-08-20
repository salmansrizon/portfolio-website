import { Button } from "@/components/ui/button";
import { TableSkeleton } from '@/components/ui/skeletons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { courseCategoryConfig } from "@/adapters/entityConfigs";
import { EntityFormDialog } from "./EntityFormDialog";
import ListPager from './ListPager';
import { useEntityManager } from "@/hooks/useEntityManager";

export default function CourseCategoryManager() {
  const { items: categories, pageItems, pagination, isLoading, openCreate, openEdit, remove, dialog } = useEntityManager(courseCategoryConfig);

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "None (Root)";
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderTree className="w-6 h-6" /> Course Categories
        </h2>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
      </div>

      <ListPager pagination={pagination} label="categories" />


      <EntityFormDialog
        config={courseCategoryConfig}
        {...dialog}
        dynamicOptions={{
          parent_id: categories
            .filter(c => c.id !== dialog.initialData?.id)
            .map(c => ({ label: c.name, value: c.id })),
        }}
      />

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0"><TableSkeleton rows={5} /></TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No categories found. Create one above.</TableCell>
              </TableRow>
            ) : (
              pageItems.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>
                    {category.parent_id ? (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">{getParentName(category.parent_id)}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Root Category</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(category)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
