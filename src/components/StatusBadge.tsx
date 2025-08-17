import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "cancelled" | "active" | "inactive";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-success text-success-foreground hover:bg-success/80";
      case "pending":
        return "bg-warning text-warning-foreground hover:bg-warning/80";
      case "processing":
        return "bg-primary text-primary-foreground hover:bg-primary/80";
      case "cancelled":
      case "inactive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/80";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  return (
    <Badge className={cn(getStatusStyles(status), className)} variant="secondary">
      {children}
    </Badge>
  );
}