// app/api/commandes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  createCommande,
  deleteCommande,
  getAllCommandes,
  getCommandeById,
  getUserCommandes,
  getCommandesByStatus,
  updateCommandeStatus,
  addPaymentToCommande,
} from '@/app/api/controllers/commandeController';

export async function POST(req: NextRequest) {
  return createCommande(req);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  if (id) return getCommandeById(id);
  if (userId) return getUserCommandes(userId);
  if (status) return getCommandesByStatus(status);

  return getAllCommandes();
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 });
  }
  return deleteCommande(id);
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const payment = req.nextUrl.searchParams.get('payment');

  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 });
  }

  if (payment === 'true') {
    return addPaymentToCommande(req, id);
  }

  return updateCommandeStatus(req, id);
}
