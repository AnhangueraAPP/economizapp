
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Transaction, CategoryType, TransactionType } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  type: z.enum(["income", "expense"]),
  description: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres",
  }),
  date: z.date(),
  categoryId: z.string({
    required_error: "Selecione uma categoria",
  }),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["monthly", "weekly", "yearly"]).optional(),
});

type TransactionFormProps = {
  onSubmit: (data: Omit<Transaction, 'id' | 'userId'>) => void;
  onCancel?: () => void;
  initialData?: Partial<Transaction>;
  title?: string;
  submitLabel?: string;
};

export const TransactionForm = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  title = "Nova Transação",
  submitLabel = "Salvar"
}: TransactionFormProps) => {
  const { categories } = useFinance();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Filter categories based on transaction type
  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>(
    initialData?.type 
      ? categories.filter(c => {
          if (initialData.type === 'income') {
            return c.name === 'Salário' || c.name === 'Investimentos';
          } else {
            return c.name !== 'Salário' && c.name !== 'Investimentos';
          }
        })
      : categories.filter(c => c.name !== 'Salário' && c.name !== 'Investimentos')
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: initialData?.amount?.toString() || "",
      type: initialData?.type || "expense",
      description: initialData?.description || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      categoryId: initialData?.categoryId || "",
      isRecurring: initialData?.isRecurring || false,
      recurringFrequency: initialData?.recurringFrequency || "monthly",
    },
  });
  
  const watchType = form.watch("type");
  const watchIsRecurring = form.watch("isRecurring");
  
  // Update filtered categories when type changes
  const handleTypeChange = (type: TransactionType) => {
    form.setValue("type", type);
    form.setValue("categoryId", ""); // Reset category when type changes
    
    if (type === "income") {
      setFilteredCategories(categories.filter(c => c.name === 'Salário' || c.name === 'Investimentos'));
    } else {
      setFilteredCategories(categories.filter(c => c.name !== 'Salário' && c.name !== 'Investimentos'));
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const transaction: Omit<Transaction, 'id' | 'userId'> = {
        amount: parseFloat(values.amount),
        type: values.type,
        description: values.description,
        date: values.date,
        categoryId: values.categoryId,
        isRecurring: values.isRecurring,
        recurringFrequency: values.isRecurring ? values.recurringFrequency : undefined,
      };
      
      onSubmit(transaction);
      
      if (!initialData) {
        // Reset form if it's a new transaction
        form.reset({
          amount: "",
          type: "expense",
          description: "",
          date: new Date(),
          categoryId: "",
          isRecurring: false,
          recurringFrequency: "monthly",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar transação",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type selector */}
            <div className="flex items-center space-x-2 p-2 rounded-md border">
              <div 
                className={cn(
                  "flex-1 cursor-pointer text-center p-2 rounded-md transition-colors",
                  watchType === 'expense' 
                    ? "bg-finance-expense text-white" 
                    : "bg-gray-100 hover:bg-gray-200"
                )}
                onClick={() => handleTypeChange('expense')}
              >
                Despesa
              </div>
              <div 
                className={cn(
                  "flex-1 cursor-pointer text-center p-2 rounded-md transition-colors",
                  watchType === 'income' 
                    ? "bg-finance-income text-white" 
                    : "bg-gray-100 hover:bg-gray-200"
                )}
                onClick={() => handleTypeChange('income')}
              >
                Receita
              </div>
            </div>

            {/* Amount field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">R$</span>
                      <Input
                        placeholder="0,00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Mercado, Aluguel, Salário..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Categoria</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? filteredCategories.find(
                              (category) => category.id === field.value
                            )?.name
                          : "Selecione uma categoria"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar categoria..." />
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <CommandGroup>
                        {filteredCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => {
                              form.setValue("categoryId", category.id);
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              {category.name}
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                category.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Recurring transaction */}
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Despesa/Receita recorrente</FormLabel>
                  <FormDescription>
                    Esta transação se repete regularmente?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Recurring frequency */}
          {watchIsRecurring && (
            <FormField
              control={form.control}
              name="recurringFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
