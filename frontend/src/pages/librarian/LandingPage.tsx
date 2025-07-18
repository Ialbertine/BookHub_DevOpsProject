import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { getAllBooks, deleteBook } from "@/api/api";
import type { Book } from "@/api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { FilterState, PaginationState } from "@/types/types";

// Stats interface
interface Stat {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// API Response interface for getAllBooks
interface GetAllBooksResponse {
  data?: {
    books?: Book[];
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    genre: "",
    publishedYear: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // will open filter modal depending on state
  const filterOptions = useMemo(() => {
    const genres = [
      ...new Set(books.map((book) => book.genre).filter(Boolean)),
    ].sort();
    const years = [
      ...new Set(
        books
          .map((book) => {
            if (book.publishedDate) {
              const year = new Date(book.publishedDate).getFullYear();
              return isNaN(year) ? null : year.toString();
            }
            return null;
          })
          .filter(Boolean)
      ),
    ].sort((a, b) => b!.localeCompare(a!));

    return { genres, years };
  }, [books]);

  // Filter and paginate books
  const { filteredBooks, paginatedBooks } = useMemo(() => {
    let filtered = books.filter((book) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (book.title && book.title.toLowerCase().includes(term)) ||
        (book.author && book.author.toLowerCase().includes(term)) ||
        (book.genre && book.genre.toLowerCase().includes(term)) ||
        (book.ISBN && book.ISBN.toLowerCase().includes(term))
      );
    });

    // Apply filters
    if (filters.genre) {
      filtered = filtered.filter((book) => book.genre === filters.genre);
    }
    if (filters.publishedYear) {
      filtered = filtered.filter((book) => {
        if (!book.publishedDate) return false;
        const year = new Date(book.publishedDate).getFullYear();
        return year.toString() === filters.publishedYear;
      });
    }

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      filteredBooks: filtered,
      paginatedBooks: paginated,
      totalItems,
      totalPages,
    };
  }, [
    books,
    searchTerm,
    filters,
    pagination.currentPage,
    pagination.itemsPerPage,
  ]);

  // pagination based on the filtered books
  useEffect(() => {
    const totalItems = filteredBooks.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage,
    }));
  }, [filteredBooks.length, pagination.itemsPerPage,]);

  const stats: Stat[] = [
    {
      title: "Total Books",
      value: books.length.toString(),
      icon: BookOpen,
      color: "bg-blue-500",
    },
  ];

  // Fetch books from API
  const fetchBooks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBooks();

      console.log("API Response:", response);
      const booksData: Book[] =
        (response as GetAllBooksResponse)?.data?.books ||
        (response as Book[]) ||
        [];

      setBooks(booksData);
      console.log("Processed Books:", booksData);
    } catch (err: unknown) {
      console.error("Error fetching books:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load books. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const handleView = (book: Book): void => {
    const bookId = book._id || book.id;
    navigate(`/librarian-dashboard/view/${bookId}`);
  };

  const showDeleteConfirmation = (book: Book): void => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Delete Book</p>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete "{book.title}"? This action
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleDelete(book);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  const handleDelete = async (book: Book): Promise<void> => {
    const bookId = book._id || book.id;

    if (!bookId) {
      toast.error("Book ID not found");
      return;
    }

    try {
      setDeleting(bookId);
      const deleteResponse = await deleteBook(bookId);

      console.log("Delete response:", deleteResponse);
      setBooks((prevBooks) =>
        prevBooks.filter((b) => {
          const currentBookId = b._id || b.id;
          return currentBookId !== bookId;
        })
      );

      toast.success(`Successfully deleted: ${book.title}`);
      console.log(`Book "${book.title}" deleted successfully`);
    } catch (err: unknown) {
      console.error("Error deleting book:", err);

      let errorMessage = "Failed to delete book. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      fetchBooks();
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = (): void => {
    fetchBooks();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string
  ): void => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const clearFilters = (): void => {
    setFilters({ genre: "", publishedYear: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number): void => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number): void => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
    }));
  };

  const hasActiveFilters =
    filters.genre || filters.publishedYear;

  return (
    <div className="p-6 space-y-6 min-h-screen max-w-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">
              Here's what's happening in your library today.
            </p>
          </div>
          <div className="hidden md:block">
            <Calendar className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Hub Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Book Hub
                </h2>
                <p className="text-sm text-gray-600">
                  Manage your library collection
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                    hasActiveFilters
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                      {Object.values(filters).filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      value={filters.genre}
                      onChange={(e) =>
                        handleFilterChange("genre", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Genres</option>
                      {filterOptions.genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published Year
                    </label>
                    <select
                      value={filters.publishedYear}
                      onChange={(e) =>
                        handleFilterChange("publishedYear", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Years</option>
                      {filterOptions.years.map((year) => (
                        <option key={year} value={year ?? ""}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                      disabled={!hasActiveFilters}
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading books...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="w-full lg:overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBooks.length > 0 ? (
                    paginatedBooks.map((book) => {
                      const bookId = book._id || book.id;
                      const isDeleting = deleting === bookId;

                      return (
                        <tr
                          key={bookId}
                          className={`hover:bg-gray-50 ${
                            isDeleting ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {book.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {book.author}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {book.ISBN}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {book.genre}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {book.language}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(book)}
                                disabled={isDeleting}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleView(book)}
                                disabled={isDeleting}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => showDeleteConfirmation(book)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={isDeleting ? "Deleting..." : "Delete"}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {filteredBooks.length === 0 && books.length > 0
                          ? "No books match your search and filter criteria"
                          : books.length === 0
                          ? "No books available in the library"
                          : "No books match your search"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBooks.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select
                      value={pagination.itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      filteredBooks.length
                    )}{" "}
                    of {filteredBooks.length} results
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        const current = pagination.currentPage;
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= current - 1 && page <= current + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded ${
                              page === pagination.currentPage
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
