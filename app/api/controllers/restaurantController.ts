import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function handleServerError(error: any) {
  console.error('Erreur serveur:', error)
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 })
}

export async function createRestaurant(req: NextRequest) {
  try {
    const body = await req.formData()
    const name = body.get('name')?.toString()
    const phone = body.get('phone')?.toString()
    const adresse = body.get('adresse')?.toString()
    const image = body.get('image')?.toString()
    const description = body.get('description')?.toString()
    const latitude = parseFloat(body.get('latitude')?.toString() || '0')
    const longitude = parseFloat(body.get('longitude')?.toString() || '0')
    const adminId = body.get('adminId')?.toString()
    const villeId = body.get('villeId')?.toString()

    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        phone,
        adresse,
        image,
        description,
        latitude,
        longitude,
        admin: adminId ? { connect: { id: parseInt(adminId) } } : undefined,
        ville: villeId ? { connect: { id: parseInt(villeId) } } : undefined,
      },
    })

    return NextResponse.json({ message: 'Restaurant créé avec succès', restaurant: newRestaurant }, { status: 201 })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function getAllRestaurants() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        menus: true,
        heuresOuverture: true,
        ville: true,
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    return handleServerError(error)
  }
}

export async function getRestaurantById(id: string) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        menus: true,
        heuresOuverture: true,
        ville: true,
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })
    if (!restaurant) {
      return NextResponse.json({ message: 'Restaurant non trouvé' }, { status: 404 })
    }
    return NextResponse.json(restaurant)
  } catch (error) {
    return handleServerError(error)
  }
}

export async function updateRestaurant(req: NextRequest, id: string) {
  try {
    const body = await req.formData()
    const name = body.get('name')?.toString()
    const phone = body.get('phone')?.toString()
    const adresse = body.get('adresse')?.toString()
    const image = body.get('image')?.toString()
    const description = body.get('description')?.toString()
    const latitude = parseFloat(body.get('latitude')?.toString() || '0')
    const longitude = parseFloat(body.get('longitude')?.toString() || '0')
    const adminId = body.get('adminId')?.toString()
    const villeId = body.get('villeId')?.toString()

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone,
        adresse,
        image,
        description,
        latitude,
        longitude,
        admin: adminId ? { connect: { id: parseInt(adminId) } } : undefined,
        ville: villeId ? { connect: { id: parseInt(villeId) } } : undefined,
      },
    })

    return NextResponse.json({ message: 'Restaurant mis à jour avec succès', restaurant: updatedRestaurant })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function deleteRestaurant(id: string) {
  try {
    await prisma.restaurant.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Restaurant supprimé avec succès' })
  } catch (error) {
    return handleServerError(error)
  }
}

export async function searchRestaurants(query: string) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { adresse: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { ville: true },
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    return handleServerError(error)
  }
}
