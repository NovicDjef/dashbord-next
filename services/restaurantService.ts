export async function fetchRestaurant() {
  const res = await fetch('/api/routes/restaurant');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
