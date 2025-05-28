import { NextRequest, NextResponse } from 'next/server';
import {
  signUpAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} from '@/app/api/controllers/adminController';

export async function POST(req: NextRequest) {
  return signUpAdmin(req); 
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) return getAdminById(id);
  return getAllAdmins();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updateAdmin(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteAdmin(id);
}
