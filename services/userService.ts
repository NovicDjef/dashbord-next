export async function fetchUsers() {
  const res = await fetch('/api/routes/users/signup');
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs');
  }
  return res.json();
}
