import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function signUpAdmin(req: NextRequest) {
  try {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const email = body.get('email')?.toString();
    const password = body.get('password')?.toString();
    const phone = body.get('phone')?.toString();
    const image = body.get('image')?.toString();

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Email ou téléphone déjà utilisé' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password!, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        image
      },
      include: {
        userRoles: true,
        restaurants: true,
        geolocalisation: true
      }
    });

    const token = jwt.sign(
      { adminId: newAdmin.id, email: newAdmin.email, phone: newAdmin.phone },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'Admin créé avec succès',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        phone: newAdmin.phone
      },
      token
    }, { status: 201 });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function login(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, password } = body;

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, phone: admin.phone },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'Authentification réussie',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone
      },
      token
    });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAllAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        userRoles: true,
        restaurants: true,
        geolocalisation: true
      }
    });
    return NextResponse.json(admins);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAdminById(id: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
      include: {
        userRoles: true,
        restaurants: true,
        geolocalisation: true
      }
    });

    if (!admin) {
      return NextResponse.json({ message: 'Admin non trouvé' }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function updateAdmin(req: NextRequest, id: string) {
  try {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const email = body.get('email')?.toString();
    const phone = body.get('phone')?.toString();
    const image = body.get('image')?.toString();

    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: {
        username,
        email,
        phone,
        image
      }
    });

    return NextResponse.json({
      message: 'Admin mis à jour avec succès',
      admin: updatedAdmin
    });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function deleteAdmin(id: string) {
  try {
    await prisma.admin.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Admin supprimé avec succès' });
  } catch (error: any) {
    return handleServerError(error);
  }
}

function handleServerError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}
