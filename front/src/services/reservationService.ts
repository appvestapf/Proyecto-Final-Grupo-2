const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface BlockedDateRange {
  startDate: string;
  endDate: string;
}

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
  },

  async getBlockedDates(propertyId: string): Promise<BlockedDateRange[]> {
    try {
      const response = await fetch(
        `${API_URL}/reservations/property/${propertyId}/blocked-dates`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Error al obtener las fechas bloqueadas');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error obteniendo fechas bloqueadas para la propiedad ${propertyId}:`, error);
      return [];
    }
  }
};