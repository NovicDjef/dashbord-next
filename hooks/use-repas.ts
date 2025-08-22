"use client"

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { 
  fetchRepas, 
  createRepas, 
  updateRepas, 
  deleteRepas,
  clearError 
} from '@/redux/repasSlice';

export function useRepas() {
  const dispatch = useDispatch();
  const { data: repas, status, error } = useSelector((state: any) => state.repas);

  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isSuccess = status === 'succeeded';

  const fetchRepasList = useCallback(() => {
    dispatch(fetchRepas());
  }, [dispatch]);

  const addRepas = useCallback((repasData: any) => {
    return dispatch(createRepas(repasData));
  }, [dispatch]);

  const editRepas = useCallback((id: number, data: any) => {
    return dispatch(updateRepas({ id, data }));
  }, [dispatch]);

  const removeRepas = useCallback((id: number) => {
    return dispatch(deleteRepas(id));
  }, [dispatch]);

  const clearRepasError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    repas,
    isLoading,
    isError,
    isSuccess,
    error,
    fetchRepasList,
    addRepas,
    editRepas,
    removeRepas,
    clearRepasError,
  };
}