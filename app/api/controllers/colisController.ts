import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

function handleServerError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}

export async function createColis(req: NextRequest) {
  try {
    const body = await req.formData();
    const description = body.get('description')?.toString();
    const poids = parseFloat(body.get('poids')?.toString() || '0');
    const adresseDepart = body.get('adresseDepart')?.toString();
    const adresseArrivee = body.get('adresseArrivee')?.toString();
    const usernameSend = body.get('usernameSend')?.toString();
    const usernamRecive = body.get('usernamRecive')?.toString();
    const phoneRecive = parseFloat(body.get('phoneRecive')?.toString() || '0');
    const prix = parseFloat(body.get('prix')?.toString() || '0');
    const userId = parseInt(body.get('userId')?.toString() || '0');
    const imageColis = body.get('imageColis')?.toString() || null;

    const newColis = await prisma.colis.create({
      data: {
        description,
        poids,
        adresseDepart,
        adresseArrivee,
        imageColis,
        prix,
        status: 'EN_ATTENTE',
        usernameSend,
        usernamRecive,
        phoneRecive,
        user: { connect: { id: userId } },
      },
      include: {
        user: true,
        livraison: true,
      },
    });

    return NextResponse.json({ message: 'Colis créé avec succès', colis: newColis }, { status: 201 });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAllColis() {
  try {
    const colis = await prisma.colis.findMany({
      include: { user: true, livraison: true },
    });
    return NextResponse.json(colis);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getColisById(id: string) {
  try {
    const colis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, livraison: true },
    });

    if (!colis) return NextResponse.json({ message: 'Colis non trouvé' }, { status: 404 });
    return NextResponse.json(colis);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function deleteColis(id: string) {
  try {
    await prisma.colis.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Colis supprimé avec succès' });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function updateCommandeStatus(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { status } = body;

    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json({ message: 'Statut mis à jour', commande: updatedColis });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getUserColis(userId: string) {
  try {
    const colis = await prisma.colis.findMany({
      where: { userId: parseInt(userId) },
      include: { livraison: true },
    });
    return NextResponse.json(colis);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getColisEnLivraison() {
  try {
    const colis = await prisma.colis.findMany({
      where: { livraison: { statut: 'NON_LIVRE' } },
      include: { user: true, livraison: true },
    });
    return NextResponse.json(colis);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function addLivraisonToColis(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { type, statut, serviceLivraisonId } = body;

    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(id) },
      data: {
        livraison: {
          create: {
            type,
            statut,
            adresseDepart: '',
            adresseArrivee: '',
            serviceLivraison: serviceLivraisonId
              ? { connect: { id: parseInt(serviceLivraisonId) } }
              : undefined,
          },
        },
      },
      include: { livraison: true },
    });

    return NextResponse.json({ message: 'Livraison ajoutée', colis: updatedColis });
  } catch (error: any) {
    return handleServerError(error);
  }
}
