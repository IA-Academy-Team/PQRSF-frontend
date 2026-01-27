import { useState, useEffect, useMemo } from "react"

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage: number
  dependencies?: unknown[]
}

export function usePagination<T>({ items, itemsPerPage, dependencies = [] }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Resetear a la página 1 cuando cambian las dependencias
  useEffect(() => {
    setCurrentPage(1)
  }, dependencies)

  const totalPages = Math.ceil(items.length / itemsPerPage) || 1

  // Ajustar la página actual si es mayor que el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    currentPage: safeCurrentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
  }
}
