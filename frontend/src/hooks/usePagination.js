import { useState, useMemo } from 'react';

export default function usePagination(items, perPage = 15) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / perPage);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const reset = () => setPage(1);

  return { page, totalPages, items: paginatedItems, goTo, reset };
}
