'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({ page, currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const activePage = page ?? currentPage ?? 1;
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const from = itemsPerPage ? (activePage - 1) * itemsPerPage + 1 : undefined;
  const to = itemsPerPage ? Math.min(activePage * itemsPerPage, totalItems ?? 0) : undefined;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-default">
      {totalItems !== undefined && itemsPerPage ? (
        <p className="text-xs text-secondary">Mostrando {from}–{to} de {totalItems}</p>
      ) : <div />}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(activePage - 1)} disabled={activePage === 1}
          className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-app disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map(p => (
          <button
            key={p} onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
              p === activePage
                ? 'bg-sigo-primary text-white'
                : 'text-secondary hover:bg-app hover:text-primary'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(activePage + 1)} disabled={activePage === totalPages}
          className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-app disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Hook helper
export function usePagination<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);
  return { page, setPage, totalPages, paged, totalItems: items.length };
}

import { useState } from 'react';
