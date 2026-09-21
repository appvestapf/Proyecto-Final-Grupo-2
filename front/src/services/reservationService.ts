const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reservationService = {
  async getMyReservations(token: string) {
    try {
      const response = await fetch(`${API_URL}/reservations/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getMyReservations:", error);
      return [];
    }
  }
};