import { NextRequest, NextResponse } from 'next/server';
import {
  createMenu,
  deleteMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  getMenusByRestaurant,
  getCategoriesByMenu,
  addCategoryToMenu,
} from '@/app/api/controllers/menuController';

export async function POST(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const menuId = search.get('menuId');
  if (menuId) return addCategoryToMenu(req, menuId);
  return createMenu(req);
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const id = search.get('id');
  const restaurantId = search.get('restaurantId');
  const getCategories = search.get('getCategories');

  if (restaurantId) return getMenusByRestaurant(restaurantId);
  if (id && getCategories === 'true') return getCategoriesByMenu(id);
  if (id) return getMenuById(id);
  return getAllMenus();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updateMenu(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteMenu(id);
}
