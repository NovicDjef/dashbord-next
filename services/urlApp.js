// export default baseImage = 'http://api.koursier.com/images';
// export default baseImage = 'https://nguetioofa.dev:4040/images';
//  const BASE_URL = 'https://api.novic.dev';
 const BASE_URL = 'http://192.168.1.86:3001';
export const baseImage = (path) => {
  if (!path) return null;

  return path.startsWith('images/')
    ? `${BASE_URL}/${path}`
    : `${BASE_URL}/images/${path}`;
};