import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  BookOpen, 
  User, 
  Hash, 
  Tag, 
  Globe, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Edit,
  Save,
  X
} from "lucide-react"
import { getBookById, updateBook } from "../../api/api"
import type { Book } from "../../api/api"
import toast from "react-hot-toast"

// Edit form data interface
interface EditFormData {
  title: string
  author: string
  ISBN: string
  genre: string
  language: string
  publishedDate: string
  description: string
}

// Book detail configuration interface
interface BookDetail {
  label: string
  value: string | undefined
  field: keyof EditFormData
  icon: React.ComponentType<{ className?: string }>
  color: string
  type: 'text' | 'date'
}

const ViewBook: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<EditFormData>({
    title: "",
    author: "",
    ISBN: "",
    genre: "",
    language: "",
    publishedDate: "",
    description: ""
  })
  const [saving, setSaving] = useState(false)

  // Fetch book details
  const fetchBook = useCallback(async (): Promise<void> => {
    if (!id) {
      setError("Book ID is required")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await getBookById(id)
      
      // Handle different response structures with proper typing
      const bookData: Book = (response as { data?: Book }).data || (response as Book)
      setBook(bookData)
      console.log("Book data:", bookData)
    } catch (err: unknown) {
      console.error("Error fetching book:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load book details. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  const handleEdit = (): void => {
    if (book) {
      setIsEditing(true)
      setEditData({
        title: book.title || "",
        author: book.author || "",
        ISBN: book.ISBN || "",
        genre: book.genre || "",
        language: book.language || "",
        publishedDate: book.publishedDate || "",
        description: book.description || ""
      })
    }
  }

  const handleCancelEdit = (): void => {
    setIsEditing(false)
    setEditData({
      title: "",
      author: "",
      ISBN: "",
      genre: "",
      language: "",
      publishedDate: "",
      description: ""
    })
  }

  const handleSaveEdit = async (): Promise<void> => {
    if (!book) return

    try {
      setSaving(true)
      const bookId = book._id || book.id || ""
      const updatedBook = await updateBook(bookId, editData)
      
      // Handle different response structures with proper typing
      const bookData: Book = (updatedBook as { data?: Book }).data || (updatedBook as Book)
      setBook(bookData)
      setIsEditing(false)
      setEditData({
        title: "",
        author: "",
        ISBN: "",
        genre: "",
        language: "",
        publishedDate: "",
        description: ""
      })
      toast.success('Book updated successfully!')
    } catch (err: unknown) {
      console.error("Error updating book:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update book. Please try again."
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof EditFormData, value: string): void => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
    console.log(`Updating ${field}:`, value) // Debug log
  }

  const handleBack = (): void => {
    navigate("/librarian-dashboard")
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600 text-lg">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The requested book could not be found."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={fetchBook}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const bookDetails: BookDetail[] = [
    {
      label: "Title",
      value: book.title,
      field: "title",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50",
      type: "text"
    },
    {
      label: "Author",
      value: book.author,
      field: "author",
      icon: User,
      color: "text-green-600 bg-green-50",
      type: "text"
    },
    {
      label: "ISBN",
      value: book.ISBN,
      field: "ISBN",
      icon: Hash,
      color: "text-purple-600 bg-purple-50",
      type: "text"
    },
    {
      label: "Genre",
      value: book.genre,
      field: "genre",
      icon: Tag,
      color: "text-orange-600 bg-orange-50",
      type: "text"
    },
    {
      label: "Language",
      value: book.language,
      field: "language",
      icon: Globe,
      color: "text-indigo-600 bg-indigo-50",
      type: "text"
    },
    {
      label: "Published Date",
      value: book.publishedDate,
      field: "publishedDate",
      icon: Calendar,
      color: "text-red-600 bg-red-50",
      type: "date"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Library</span>
            </button>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Book
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Title Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full bg-white/10 text-white placeholder-white/70 border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20"
                    placeholder="Enter book title"
                  />
                ) : (
                  book.title
                )}
              </h1>
              <p className="text-blue-100 text-lg">
                by {isEditing ? (
                  <input
                    type="text"
                    value={editData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    className="bg-white/10 text-blue-100 placeholder-blue-200 border border-white/30 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 min-w-0"
                    placeholder="Enter author name"
                  />
                ) : (
                  book.author
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Book Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {bookDetails.map((detail, index) => {
            const Icon = detail.icon
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${detail.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {detail.label}
                    </h3>
                    {isEditing ? (
                      detail.type === "date" ? (
                        <input
                          type="date"
                          value={editData[detail.field] ? new Date(editData[detail.field]).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleInputChange(detail.field, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editData[detail.field]}
                          onChange={(e) => handleInputChange(detail.field, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${detail.label.toLowerCase()}`}
                        />
                      )
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 mt-1 break-words">
                        {detail.type === "date" ? formatDate(detail.value) : (detail.value || "Not specified")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Description
              </h3>
              <div className="prose max-w-none">
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Enter book description"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {book.description || "No description available for this book."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        {(book.createdAt || book.updatedAt) && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {book.createdAt && (
                <div>
                  <span className="font-medium">Added:</span>{" "}
                  {formatDate(book.createdAt)}
                </div>
              )}
              {book.updatedAt && book.updatedAt !== book.createdAt && (
                <div>
                  <span className="font-medium">Last updated:</span>{" "}
                  {formatDate(book.updatedAt)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewBook