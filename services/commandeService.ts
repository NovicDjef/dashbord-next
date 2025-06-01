export async function fetchCommande() {
  const res = await fetch('/api/routes/commande');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
