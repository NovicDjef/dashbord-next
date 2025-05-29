export async function fetchRepas() {
  const res = await fetch('/api/routes/repas');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
