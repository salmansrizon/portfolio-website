import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { calculateCountdown } from "@/utils/countdown";

interface CourseCountdownProps {
  startDate: string | Date | null;
  className?: string;
  showIcon?: boolean;
}

export function CourseCountdown({ startDate, className = "", showIcon = true }: CourseCountdownProps) {
  const [countdown, setCountdown] = useState(() => 
    startDate ? calculateCountdown(startDate) : null
  );

  useEffect(() => {
    if (!startDate) return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!startDate || !countdown) return null;

  if (countdown.isExpired) {
    return (
      <Badge variant="secondary" className={`${className} bg-success-strong text-success-strong-foreground`}>
        {showIcon && <Clock className="w-3 h-3 mr-1" />}
        Started
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`${className} bg-warning-soft text-warning-foreground`}>
      {showIcon && <Clock className="w-3 h-3 mr-1" />}
      {countdown.timeLeft}
    </Badge>
  );
}