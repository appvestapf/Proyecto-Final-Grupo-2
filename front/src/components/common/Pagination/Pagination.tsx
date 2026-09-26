import { Button } from "../Button/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export const Pagination = ({ currentPage, totalPages, onNext, onPrev }: PaginationProps) => {
  return (
    <div className="flex justify-center items-center gap-6 mt-10">
      <Button variant="outline" onClick={onPrev} disabled={currentPage === 1}>
        Anterior
      </Button>
      <span className="font-medium text-sm text-muted">
        Página <strong className="text-main">{currentPage}</strong> de <strong className="text-main">{totalPages}</strong>
      </span>
      <Button variant="outline" onClick={onNext} disabled={currentPage === totalPages}>
        Siguiente
      </Button>
    </div>
  );
};