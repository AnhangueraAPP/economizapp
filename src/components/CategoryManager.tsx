
import { useState } from "react";
import { CategoryType } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Cor inválida, use formato hexadecimal (ex: #FF0000)",
  }),
});

export const CategoryManager = () => {
  const { categories, addCategory, editCategory, deleteCategory } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#6b7280",
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
      editCategory(editingCategory.id, values);
    } else {
      addCategory(values);
    }
    
    resetAndClose();
  };
  
  const handleEdit = (category: CategoryType) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      color: category.color,
    });
    setIsDialogOpen(true);
  };
  
  const resetAndClose = () => {
    form.reset({
      name: "",
      color: "#6b7280",
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categorias</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingCategory(null)}>
              <Plus className="mr-1 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar categoria" : "Nova categoria"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alimentação, Transporte..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cor</FormLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="category-color"
                          className="h-10 w-12 border rounded-md p-1 cursor-pointer bg-white"
                          {...field}
                        />
                        <Input {...field} placeholder="#FF0000" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetAndClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingCategory ? "Salvar" : "Adicionar"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex justify-between items-center p-3 rounded-md border"
          >
            <div className="flex items-center">
              <div
                className="h-6 w-6 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="font-medium">{category.name}</span>
              {category.isDefault && (
                <span className="text-xs ml-2 px-2 py-0.5 bg-muted rounded-full">Padrão</span>
              )}
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(category)}
                disabled={category.isDefault}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={category.isDefault}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteCategory(category.id)}
                    >
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
