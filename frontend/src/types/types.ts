// auth types
export interface RegisterUserData {
  FullName: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateBookData extends Partial<BookData> {
  id: string;
}

export interface Book extends BookData {
  id?: string;      
  _id?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}


// book types
export interface BookData {
  title: string;
  author: string;
  description: string;
  ISBN: string;
  genre: string;
  language: string;
  publishedDate: string;
}

export interface FormErrors {
  title?: string;
  author?: string;
  description?: string;
  ISBN?: string;
  genre?: string;
  language?: string;
  publishedDate?: string;
}

// Filter state interface
export interface FilterState {
  genre: string
  publishedYear: string
}

// Pagination state interface
export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}