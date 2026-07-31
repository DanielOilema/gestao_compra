import React from "react";
import { Link } from "react-router-dom";
import { Badge, cn } from "@gestao-compra/ui";
import type { LucideIcon } from "lucide-react";

interface MenuCardProps {
  title: string;
  icon: LucideIcon;
  to: string;
  badge?: number;
  className?: string;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, icon: Icon, to, badge, className }) => {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-all hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className="text-xs shrink-0">
            {badge}
          </Badge>
        )}
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {title}
        </p>
      </div>
      <div className="shrink-0 rounded-md bg-muted p-1.5 transition-colors group-hover:bg-primary/10">
        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    </Link>
  );
};

export default MenuCard;
