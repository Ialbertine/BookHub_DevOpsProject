import axiosInstance from './axiosConfig';
import type { BookData, Book, UpdateBookData, RegisterUserData, LoginCredentials } from '../types/types';


// Auth API functions
export const registerUser = async (userData: RegisterUserData) => {
  const response = await axiosInstance.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials);
  return response.data;
};

// Book CRUD API functions
// Create a new book
export const createBook = async (bookData: BookData): Promise<Book> => {
  try {
    const response = await axiosInstance.post('/api/books/create', bookData);
    return response.data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Get all books 
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const response = await axiosInstance.get('/api/books/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Get a single book by ID
export const getBookById = async (bookId: string): Promise<Book> => {
  try {
    const response = await axiosInstance.get(`/api/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

// Update a book 
export const updateBook = async (bookId: string, updateData: Partial<BookData>): Promise<Book> => {
  try {
    const response = await axiosInstance.put(`/api/books/${bookId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete a book
export const deleteBook = async (bookId: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/api/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

export type { BookData, Book, UpdateBookData, RegisterUserData, LoginCredentials };