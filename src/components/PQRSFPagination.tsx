import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getVisiblePages } from "@/lib/pqrsf-utils"

interface PQRSFPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PQRSFPagination({ currentPage, totalPages, onPageChange }: PQRSFPaginationProps) {
  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(currentPage - 1)
              }}
            />
          </PaginationItem>
        )}
        {visiblePages.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(pageNum)
              }}
              isActive={currentPage === pageNum}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
