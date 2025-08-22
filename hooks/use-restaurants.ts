"use client"

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { 
  fetchRestaurantsData, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  clearError 
} from '@/redux/restaurantSlice';

export function useRestaurants() {
  const dispatch = useDispatch();
  const { data: restaurants, status, error } = useSelector((state: any) => state.restaurants);

  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isSuccess = status === 'succeeded';

  const fetchRestaurants = useCallback(() => {
    dispatch(fetchRestaurantsData());
  }, [dispatch]);

  const addRestaurant = useCallback((restaurantData: any) => {
    return dispatch(createRestaurant(restaurantData));
  }, [dispatch]);

  const editRestaurant = useCallback((id: number, data: any) => {
    return dispatch(updateRestaurant({ id, data }));
  }, [dispatch]);

  const removeRestaurant = useCallback((id: number) => {
    return dispatch(deleteRestaurant(id));
  }, [dispatch]);

  const clearRestaurantError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    restaurants,
    isLoading,
    isError,
    isSuccess,
    error,
    fetchRestaurants,
    addRestaurant,
    editRestaurant,
    removeRestaurant,
    clearRestaurantError,
  };
}