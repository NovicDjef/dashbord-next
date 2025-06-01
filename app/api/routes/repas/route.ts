import { NextRequest, NextResponse } from 'next/server';
import {
  createPlat,
  deletePlat,
  getAllPlats,
  getPlatById,
  updatePlat,
} from '@/app/api/controllers/platsController';

export async function POST(req: NextRequest) {
  return createPlat(req);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) return getPlatById(id);
  return getAllPlats();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updatePlat(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deletePlat(id);
}
