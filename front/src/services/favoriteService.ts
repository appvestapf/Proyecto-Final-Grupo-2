const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const favoriteService = {
  getMyFavorites: async (token: string) => {
    const res = await fetch(`${API_URL}/properties/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
  },

  addFavorite: async (propertyId: string, token: string) => {
    const res = await fetch(`${API_URL}/properties/${propertyId}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al agregar favorito');
    return res.json();
  },

  removeFavorite: async (propertyId: string, token: string) => {
    const res = await fetch(`${API_URL}/properties/${propertyId}/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al remover favorito');
    return res.json();
  },
};