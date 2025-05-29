import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

function handleServerError(error: any) {
  console.error('Erreur serveur:', error)
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 })
}

export async function createPlat(req: NextRequest) {
  try {
    const body = await req.formData()
    const name = body.get('name')?.toString()
    const image = body.get('image')?.toString()
    const description = body.get('description')?.toString()
    const prix = parseFloat(body.get('prix')?.toString() || '0')
    const categorieId = body.get('categorieId')?.toString()

    const newPlat = await prisma.plats.create({
      data: {
        name,
        image,
        description,
        prix,
        categorie: categorieId ? { connect: { id: parseInt(categorieId) } } : undefined,
      },
      include: { categorie: true },
    })

    return NextResponse.json({ message: 'Plat créé avec succès', plat: newPlat }, { status: 201 })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function getAllPlats() {
  try {
    const plats = await prisma.plats.findMany({
      include: {
        categorie: true,
        notes: true,
        favoritePlats: true,
      },
    })
    return NextResponse.json(plats)
  } catch (error) {
    return handleServerError(error)
  }
}

export async function getPlatById(id: string) {
  try {
    const plat = await prisma.plats.findUnique({
      where: { id: parseInt(id) },
      include: {
        categorie: true,
        notes: true,
        favoritePlats: true,
      },
    })
    if (!plat) {
      return NextResponse.json({ message: 'Plat non trouvé' }, { status: 404 })
    }
    return NextResponse.json(plat)
  } catch (error) {
    return handleServerError(error)
  }
}

export async function updatePlat(req: NextRequest, id: string) {
  try {
    const body = await req.formData()
    const name = body.get('name')?.toString()
    const image = body.get('image')?.toString()
    const description = body.get('description')?.toString()
    const prix = parseFloat(body.get('prix')?.toString() || '0')
    const categorieId = body.get('categorieId')?.toString()

    const updatedPlat = await prisma.plats.update({
      where: { id: parseInt(id) },
      data: {
        name,
        image,
        description,
        prix,
        categorie: categorieId ? { connect: { id: parseInt(categorieId) } } : undefined,
      },
      include: { categorie: true },
    })

    return NextResponse.json({ message: 'Plat mis à jour avec succès', plat: updatedPlat })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function deletePlat(id: string) {
  try {
    await prisma.plats.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Plat supprimé avec succès' })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function searchPlats(query: string) {
  try {
    const plats = await prisma.plats.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { categorie: true },
    })
    return NextResponse.json(plats)
  } catch (error) {
    return handleServerError(error)
  }
}
