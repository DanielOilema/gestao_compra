import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@gestao-compra/ui";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackToMenu?: boolean;
  onBackToMenuClick?: () => void;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackToMenu = true,
  onBackToMenuClick,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {showBackToMenu && (
          onBackToMenuClick ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-1 h-8 px-2"
              onClick={onBackToMenuClick}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao menu
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="-ml-2 mb-1 h-8 px-2" asChild>
              <Link to="/home">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao menu
              </Link>
            </Button>
          )
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
