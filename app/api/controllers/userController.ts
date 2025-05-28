// /app/api/controllers/userController.ts (adapté pour Next.js)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function signUpUser(req: NextRequest) {
  try {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const phone = body.get('phone')?.toString();
    const password = body.get('password')?.toString();
    const avatar = body.get('avatar')?.toString();

    if (!username || !phone || !password) {
      return NextResponse.json({
        success: false,
        message: 'Tous les champs requis doivent être remplis',
        userMessage: 'Veuillez remplir tous les champs obligatoires.'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Un utilisateur avec ce numéro de téléphone existe déjà",
        userMessage: "Ce numéro de téléphone est déjà associé à un compte."
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, phone, password: hashedPassword, avatar }
    });

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, phone: newUser.phone, avatar: newUser.avatar },
      process.env.JWT_SECRET!,
      { expiresIn: '4383h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userMessage: 'Votre compte a été créé avec succès. Bienvenue !',
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        avatar: newUser.avatar
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
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({
        success: false,
        message: 'Le numéro de téléphone et le mot de passe sont requis',
        userMessage: 'Veuillez entrer votre numéro de téléphone et votre mot de passe.'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({
        success: false,
        message: 'Identifiants invalides',
        userMessage: "Le numéro ou le mot de passe est incorrect."
      }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, username: user.username, avatar: user.avatar },
      process.env.JWT_SECRET!,
      { expiresIn: '4383h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      userMessage: 'Vous êtes maintenant connecté.',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar
      },
      token
    });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function PostByPhone(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (!user) return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function resetPassword(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, newPassword } = body;
    if (!phone || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Entrées invalides',
        userMessage: 'Veuillez fournir un numéro et un nouveau mot de passe.'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '4383h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      userMessage: 'Mot de passe mis à jour avec succès.',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone
      },
      token
    });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function updateUser(req: NextRequest, id: string) {
  try {
    const body = await req.formData();
    const username = body.get('username')?.toString();
    const phone = body.get('phone')?.toString();
    const image = body.get('image')?.toString();

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        phone,
        avatar: image
      }
    });

    return NextResponse.json({
      message: 'Utilisateur mis à jour',
      user: updatedUser
    });
  } catch (error: any) {
    return handleServerError(error);
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error: any) {
    return handleServerError(error);
  }
}

function handleServerError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}
