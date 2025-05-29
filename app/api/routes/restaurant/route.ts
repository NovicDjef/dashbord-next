import { NextRequest, NextResponse } from 'next/server';
import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
} from '@/app/api/controllers/restaurantController';

export async function POST(req: NextRequest) {
  return createRestaurant(req);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) return getRestaurantById(id);
  return getAllRestaurants();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updateRestaurant(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteRestaurant(id);
}
