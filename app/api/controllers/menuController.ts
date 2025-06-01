import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function createMenu(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, restaurantId } = body;

    const newMenu = await prisma.menu.create({
      data: {
        name,
        restaurant: { connect: { id: parseInt(restaurantId) } },
      },
      include: { restaurant: true },
    });

    return NextResponse.json({ message: 'Menu créé avec succès', menu: newMenu }, { status: 201 });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAllMenus() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        restaurant: true,
        categories: true,
      },
    });
    return NextResponse.json(menus);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getMenuById(id: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
        categories: { include: { plats: true } },
      },
    });
    if (!menu) return NextResponse.json({ message: 'Menu non trouvé' }, { status: 404 });
    return NextResponse.json(menu);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function updateMenu(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { name, restaurantId } = body;

    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        restaurant: restaurantId ? { connect: { id: parseInt(restaurantId) } } : undefined,
      },
      include: { restaurant: true },
    });

    return NextResponse.json({ message: 'Menu mis à jour avec succès', menu: updatedMenu });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function deleteMenu(id: string) {
  try {
    await prisma.menu.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Menu supprimé avec succès' });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getCategoriesByMenu(menuId: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(menuId) },
      include: { categories: { include: { plats: true } } },
    });
    if (!menu) return NextResponse.json({ message: 'Menu non trouvé' }, { status: 404 });
    return NextResponse.json(menu.categories);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function addCategoryToMenu(req: NextRequest, menuId: string) {
  try {
    const body = await req.json();
    const { name, image, description } = body;

    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(menuId) },
      data: {
        categories: {
          create: { name, image, description },
        },
      },
      include: { categories: true },
    });

    return NextResponse.json({ message: 'Catégorie ajoutée au menu avec succès', menu: updatedMenu });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getMenusByRestaurant(restaurantId: string) {
  try {
    const menus = await prisma.menu.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      include: { categories: { include: { plats: true } } },
    });
    return NextResponse.json(menus);
  } catch (error: any) {
    return handleServerError(error);
  }
}

function handleServerError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}
