export async function fetchMenu() {
  const res = await fetch('/api/routes/menu');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
