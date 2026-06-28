import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { createRepository } from "@/integrations/supabase/repository";
import { courseCategoryConfig } from "@/adapters/entityConfigs";

const categoryRepository = createRepository(courseCategoryConfig);

export default function CourseCategoryManager() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories = [], isLoading } = categoryRepository.useFindAll();
  const { mutate: deleteCategory } = categoryRepository.useDelete();
  const { mutate: createCategory } = categoryRepository.useCreate();
  const { mutate: updateCategory } = categoryRepository.useUpdate();
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "none"
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, name, slug: editingCategory ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast({ title: "Error", description: "Name and Slug are required.", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      parent_id: formData.parent_id === "none" ? null : formData.parent_id
    };

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, item: payload },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Category updated!" });
            setShowDialog(false);
            resetForm();
          },
          onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to save category.", variant: "destructive" }),
        }
      );
    } else {
      createCategory(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Category created!" });
          setShowDialog(false);
          resetForm();
        },
        onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to save category.", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure? This might fail if courses are using this category or if it has child categories.")) return;
    deleteCategory(id, {
      onSuccess: () => toast({ title: "Success", description: "Category deleted!" }),
      onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to delete category.", variant: "destructive" }),
    });
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", parent_id: "none" });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || "none"
    });
    setShowDialog(true);
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "None (Root)";
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderTree className="w-6 h-6" /> Course Categories
        </h2>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
              <DialogDescription>Create categories to organize your courses</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" value={formData.name} onChange={handleNameChange} placeholder="e.g. Graphic Design" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. graphic-design" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select value={formData.parent_id} onValueChange={(v) => setFormData({ ...formData, parent_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- None (Root Category) --</SelectItem>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Loading categories...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No categories found. Create one above.</TableCell>
              </TableRow>
            ) : (
              categories.map(category => (
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
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
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
