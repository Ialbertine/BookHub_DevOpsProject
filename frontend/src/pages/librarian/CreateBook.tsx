import React, { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BookOpen, 
  Save,
  Calendar,
  User,
  FileText,
  Hash,
  Tag,
  Globe
} from 'lucide-react';
import { createBook } from '@/api/api';
import type { BookData, FormErrors } from '@/types/types'; 


const CreateBook: React.FC = () => {
  const [formData, setFormData] = useState<BookData>({
    title: '',
    author: '',
    description: '',
    ISBN: '',
    genre: '',
    language: '',
    publishedDate: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const genres: readonly string[] = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Biography',
    'History',
    'Science',
    'Philosophy',
    'Poetry',
    'Drama',
    'Horror',
    'Adventure',
  ] as const;

  const languages: readonly string[] = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
  ] as const;

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BookData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateISBN = (ISBN: string): boolean => {
    const cleanISBN = ISBN.replace(/[^\d]/g, '');
    return cleanISBN.length === 9;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.ISBN.trim()) {
      newErrors.ISBN = 'ISBN is required';
    } else if (!validateISBN(formData.ISBN)) {
      newErrors.ISBN = 'Please enter a valid 9-digit ISBN';
    }

    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    if (!formData.publishedDate) {
      newErrors.publishedDate = 'Published date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = useCallback((): void => {
    setFormData({
      title: '',
      author: '',
      description: '',
      ISBN: '',
      genre: '',
      language: '',
      publishedDate: ''
    });
    setErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = toast.loading('Creating book...');

    try {
      const dataToSend: BookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        ISBN: formData.ISBN.replace(/[^\d]/g, ''), 
        genre: formData.genre,
        language: formData.language,
        publishedDate: new Date(formData.publishedDate).toISOString()
      };

      console.log('Sending data:', dataToSend);

      await createBook(dataToSend);
      
      toast.dismiss(loadingToast);
      toast.success(`Book "${formData.title}" has been created successfully!`, {
        duration: 4000,
      });
      
      resetForm();
      
    } catch (error: unknown) {
      console.error('Error creating book:', error);
      toast.dismiss(loadingToast);
      
      let errorMsg = 'Failed to create book. Please try again.';
      
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback((): void => {
    if (Object.values(formData).some(value => value.trim() !== '')) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Are you sure you want to cancel? All changes will be lost.</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resetForm();
                toast.success('Form cleared successfully');
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        style: {
          maxWidth: '500px',
        },
      });
    } else {
      // Navigate back to dashboard - replace with your navigation logic
      console.log('Navigate back to dashboard');
    }
  }, [formData, resetForm]);

  return (
    <>
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
          },
          success: {
            style: {
              border: '1px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              border: '1px solid #3b82f6',
            },
          },
        }}
      />

      <div className="p-6 space-y-6 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New Book</h1>
              <p className="text-gray-600">Add a new book to your library collection</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Book Information</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the details below to add a new book</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter book title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.author ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter author name"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>

              {/* ISBN */}
              <div>
                <label htmlFor="ISBN" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4" />
                  ISBN *
                </label>
                <input
                  type="text"
                  id="ISBN"
                  name="ISBN"
                  value={formData.ISBN}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.ISBN ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="123456789"
                />
                {errors.ISBN && <p className="text-red-500 text-sm mt-1">{errors.ISBN}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter exactly 9 digits</p>
              </div>

              {/* Genre */}
              <div>
                <label htmlFor="genre" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.genre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a genre</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
              </div>

              {/* Language */}
              <div>
                <label htmlFor="language" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Language *
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.language ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a language</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
              </div>

              {/* Published Date */}
              <div>
                <label htmlFor="publishedDate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Published Date *
                </label>
                <input
                  type="date"
                  id="publishedDate"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.publishedDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.publishedDate && <p className="text-red-500 text-sm mt-1">{errors.publishedDate}</p>}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter a brief description of the book"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating Book...' : 'Create Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateBook;