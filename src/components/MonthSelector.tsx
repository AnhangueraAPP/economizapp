
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

type MonthSelectorProps = {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export const MonthSelector = ({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onToday
}: MonthSelectorProps) => {
  const today = new Date();
  const isCurrentMonth = 
    currentMonth === today.getMonth() && 
    currentYear === today.getFullYear();

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onPrevMonth}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center mx-2">
        <h2 className="text-lg font-medium">{months[currentMonth]}</h2>
        <p className="text-sm text-muted-foreground">{currentYear}</p>
      </div>
      
      {!isCurrentMonth && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToday}
          className="text-xs mx-2"
        >
          Hoje
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onNextMonth}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
