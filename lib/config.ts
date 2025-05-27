import { Expo } from 'expo-server-sdk';

// Configuration globale
export const config = {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') 
      : ['http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  }
};

// Instance Expo globale
export const expo = new Expo();