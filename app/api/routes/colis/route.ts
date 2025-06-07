// app/api/colis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  createColis,
  deleteColis,
  getAllColis,
  getColisById,
  getUserColis,
  getColisEnLivraison,
  updateCommandeStatus,
  addLivraisonToColis,
} from '@/app/api/controllers/colisController'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const id = url.searchParams.get('id')
  const userId = url.searchParams.get('userId')
  const status = url.searchParams.get('status')

  if (id) return getColisById(id)
  if (userId) return getUserColis(userId)
  if (status === 'en-livraison') return getColisEnLivraison()

  return getAllColis()
}

export async function POST(req: NextRequest) {
  return createColis(req)
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const livraison = req.nextUrl.searchParams.get('livraison')
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la modification' }, { status: 400 })
  }
  if (livraison === 'true') return addLivraisonToColis(req, id)
  return updateCommandeStatus(req, id)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID requis pour la suppression' }, { status: 400 })
  }
  return deleteColis(id)
}
