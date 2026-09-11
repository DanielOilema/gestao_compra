import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@gestao-compra/ui";

interface RelatorioPaginationProps {
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

const RelatorioPagination: React.FC<RelatorioPaginationProps> = ({
  page,
  hasNextPage,
  hasPreviousPage,
  onPrevious,
  onNext,
  isLoading = false,
}) => {
  const previousDisabled = !hasPreviousPage || isLoading;
  const nextDisabled = !hasNextPage || isLoading;

  return (
    <Pagination className="justify-center sm:justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={previousDisabled}
            className={previousDisabled ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (!previousDisabled) onPrevious();
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-muted-foreground">Página {page}</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={nextDisabled}
            className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (!nextDisabled) onNext();
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default RelatorioPagination;
