export async function fetchColis() {
  const res = await fetch('/api/routes/colis');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
