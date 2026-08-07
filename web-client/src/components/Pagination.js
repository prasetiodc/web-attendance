import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange, onLimitChange }) {
  if (!meta || meta.totalPages <= 0) return null;

  const { page, totalPages, total, limit } = meta;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span>
          Showing <strong>{Math.min((page - 1) * limit + 1, total)}</strong>–<strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> records
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label>Per page:</label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="page-size-select"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="pagination-buttons">
          <button
            className="page-btn"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="page-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              className={`page-btn ${pageNum === page ? 'page-btn-active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="page-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
