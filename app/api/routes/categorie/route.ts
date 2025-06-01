import { NextRequest, NextResponse } from 'next/server';
import {
  createCategorie,
  deleteCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  getPlatsByCategorie,
  getCategoriesByMenu,
  addPlatToCategorie,
} from "@/app/api/controllers/categorieController"
export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const addPlat = searchParams.get('categorieId');

  if (addPlat) {
    return addPlatToCategorie(req, addPlat);
  }

  return createCategorie(req);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const menuId = searchParams.get('menuId');
  const plats = searchParams.get('plats');

  if (menuId) return getCategoriesByMenu(menuId);
  if (plats && id) return getPlatsByCategorie(id);
  if (id) return getCategorieById(id);
  return getAllCategories();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updateCategorie(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteCategorie(id);
}
