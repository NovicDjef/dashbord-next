import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCategorie(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, image, description, menuId } = body;

    const categorie = await prisma.categorie.create({
      data: {
        name,
        image,
        description,
        menu: menuId ? { connect: { id: parseInt(menuId) } } : undefined,
      },
      include: { menu: true },
    });

    return NextResponse.json({ message: 'Catégorie créée avec succès', categorie }, { status: 201 });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.categorie.findMany({
      include: { menu: true, plats: true },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getCategorieById(id: string) {
  try {
    const categorie = await prisma.categorie.findUnique({
      where: { id: parseInt(id) },
      include: { menu: true, plats: true },
    });

    if (!categorie) {
      return NextResponse.json({ message: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json(categorie);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function updateCategorie(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { name, image, description, menuId } = body;

    const categorie = await prisma.categorie.update({
      where: { id: parseInt(id) },
      data: {
        name,
        image,
        description,
        menu: menuId ? { connect: { id: parseInt(menuId) } } : undefined,
      },
      include: { menu: true },
    });

    return NextResponse.json({ message: 'Catégorie mise à jour avec succès', categorie });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function deleteCategorie(id: string) {
  try {
    await prisma.categorie.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getPlatsByCategorie(id: string) {
  try {
    const categorie = await prisma.categorie.findUnique({
      where: { id: parseInt(id) },
      include: { plats: true },
    });

    if (!categorie) {
      return NextResponse.json({ message: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json(categorie.plats);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getCategoriesByMenu(menuId: string) {
  try {
    const categories = await prisma.categorie.findMany({
      where: { menuId: parseInt(menuId) },
      include: { plats: true },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function addPlatToCategorie(req: NextRequest, categorieId: string) {
  try {
    const body = await req.json();
    const { name, image, description, prix, quantity } = body;

    const updated = await prisma.categorie.update({
      where: { id: parseInt(categorieId) },
      data: {
        plats: {
          create: {
            name,
            image,
            description,
            prix: parseFloat(prix),
            quantity: parseInt(quantity),
          },
        },
      },
      include: { plats: true },
    });

    return NextResponse.json({ message: 'Plat ajouté avec succès', categorie: updated });
  } catch (error: any) {
    return handleServerError(error);
  }
}

function handleServerError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}
