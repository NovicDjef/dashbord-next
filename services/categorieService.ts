export async function fetchCategorie() {
  const res = await fetch('/api/routes/categorie');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
