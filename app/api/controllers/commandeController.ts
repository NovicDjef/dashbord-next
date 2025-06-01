import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCommande(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get('x-user-id'); // ⚠️ Changez cela selon votre auth

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucune donnée de commande n'a été envoyée",
        userMessage: "Les données de la commande sont manquantes."
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Utilisateur non trouvé",
        userMessage: "L'utilisateur est introuvable ou non authentifié."
      }, { status: 404 });
    }

    const { platsId, quantity, prix, recommandation, position, telephone, complements } = body;

    if (!platsId || !quantity || !prix || !telephone) {
      return NextResponse.json({
        success: false,
        message: "Champs obligatoires manquants",
        userMessage: "Veuillez remplir tous les champs requis."
      }, { status: 400 });
    }

    const newCommande = await prisma.commande.create({
      data: {
        quantity: parseInt(quantity),
        prix: parseFloat(prix),
        recommandation: recommandation || '',
        position: position || '',
        status: "EN_ATTENTE",
        telephone: parseInt(telephone),
        user: { connect: { id: parseInt(userId) } },
        plat: { connect: { id: parseInt(platsId) } },
      },
      include: {
        user: true,
        plat: true,
      },
    });

    if (complements && complements.length > 0) {
      const complementsData = complements.map((complement: any) => ({
        quantity: complement.quantity,
        complementId: complement.complementId,
        name: complement.name,
        price: complement.price,
        commandeId: newCommande.id
      }));

      await prisma.commandeComplement.createMany({ data: complementsData });
    }

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      userMessage: "Votre commande a été passée avec succès !",
      commande: newCommande
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la création de la commande",
      error: error.message
    }, { status: 500 });
  }
}

export async function getAllCommandes() {
  try {
    const commandes = await prisma.commande.findMany();
    return NextResponse.json(commandes);
  } catch (error: any) {
    return serverError(error);
  }
}

export async function getCommandeById(id: string) {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: parseInt(id) },
    });

    if (!commande) {
      return NextResponse.json({ message: "Commande non trouvée" }, { status: 404 });
    }

    return NextResponse.json(commande);
  } catch (error: any) {
    return serverError(error);
  }
}

export async function deleteCommande(id: string) {
  try {
    await prisma.commande.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Commande supprimée avec succès" });
  } catch (error: any) {
    return serverError(error);
  }
}

export async function getUserCommandes(userId: string) {
  try {
    const commandes = await prisma.commande.findMany({
      where: { userId: parseInt(userId) },
      include: {
        plat: true,
        payement: true,
        livraison: true,
      }
    });
    return NextResponse.json(commandes);
  } catch (error: any) {
    return serverError(error);
  }
}

export async function updateCommandeStatus(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { status } = body;

    const updatedCommande = await prisma.commande.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json({
      message: "Statut de la commande mis à jour avec succès",
      commande: updatedCommande
    });
  } catch (error: any) {
    return serverError(error);
  }
}

export async function addPaymentToCommande(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    const { amount, mode_payement, currency, status, reference, phone, email } = body;

    const updatedCommande = await prisma.commande.update({
      where: { id: parseInt(id) },
      data: {
        payement: {
          create: {
            amount: parseFloat(amount),
            mode_payement,
            currency,
            status,
            reference,
            phone,
            email,
          }
        }
      },
      include: { payement: true }
    });

    return NextResponse.json({
      message: "Paiement ajouté avec succès",
      commande: updatedCommande
    });
  } catch (error: any) {
    return serverError(error);
  }
}

export async function getCommandesByStatus(status: string) {
  try {
    const commandes = await prisma.commande.findMany({
      where: { status },
      include: {
        user: true,
        plat: true,
        payement: true,
        livraison: true,
      }
    });

    return NextResponse.json(commandes);
  } catch (error: any) {
    return serverError(error);
  }
}

function serverError(error: any) {
  console.error('Erreur serveur:', error);
  return NextResponse.json({ message: 'Une erreur est survenue', error: error.message }, { status: 500 });
}
