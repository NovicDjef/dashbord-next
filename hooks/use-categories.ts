"use client"

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { 
  fetchCategoriesData, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError 
} from '@/redux/categoriesSlice';

export function useCategories() {
  const dispatch = useDispatch();
  const { data: categories, status, error } = useSelector((state: any) => state.categories);

  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isSuccess = status === 'succeeded';

  const fetchCategories = useCallback(() => {
    dispatch(fetchCategoriesData());
  }, [dispatch]);

  const addCategory = useCallback((categoryData: any) => {
    return dispatch(createCategory(categoryData));
  }, [dispatch]);

  const editCategory = useCallback((id: number, data: any) => {
    return dispatch(updateCategory({ id, data }));
  }, [dispatch]);

  const removeCategory = useCallback((id: number) => {
    return dispatch(deleteCategory(id));
  }, [dispatch]);

  const clearCategoryError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    categories,
    isLoading,
    isError,
    isSuccess,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    clearCategoryError,
  };
}