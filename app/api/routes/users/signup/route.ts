
import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getAllUsers, getUserById, signUpUser, updateUser } from '@/app/api/controllers/userController';

export async function POST(req: NextRequest) {
  return signUpUser(req); 
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) return getUserById(id);
  return getAllUsers();
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }
  return updateUser(req, id);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteUser(id);
}

