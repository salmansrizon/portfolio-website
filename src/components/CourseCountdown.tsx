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
      <Badge variant="secondary" className={`${className} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
        {showIcon && <Clock className="w-3 h-3 mr-1" />}
        Started
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`${className} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>
      {showIcon && <Clock className="w-3 h-3 mr-1" />}
      {countdown.timeLeft}
    </Badge>
  );
}