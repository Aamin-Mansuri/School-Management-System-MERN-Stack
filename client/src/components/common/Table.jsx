import React from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Table = ({
  columns,
  data = [],
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  pagination = true,
  itemsPerPage = 8,
  actions,
  emptyMessage = 'No records found',
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset page on search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination ? data.slice(startIndex, startIndex + itemsPerPage) : data;

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Top Toolbar */}
      {(onSearchChange || actions) && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/60">
          {onSearchChange ? (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all shadow-xs"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-700/60 border-b border-slate-200/90 dark:border-slate-700/70 text-slate-500 dark:text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 dark:text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-3.5 px-4 text-slate-700 dark:text-slate-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Pagination */}
      {pagination && data.length > itemsPerPage && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/60">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-100 font-semibold">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-100 font-semibold">
              {Math.min(startIndex + itemsPerPage, data.length)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-slate-100 font-semibold">{data.length}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 shadow-2xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

