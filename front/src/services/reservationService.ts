const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface BlockedDateRange {
  startDate: string;
  endDate: string;
}

export const reservationService = {
  // 1. Obtener reservas del usuario
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

  // 2. Obtener fechas bloqueadas de una propiedad
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
  },

  // 3. Cancelar una reserva
  async cancelReservation(reservationId: string, token: string) {
    try {
      const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cancelar la reserva');
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error en cancelReservation:", error);
      throw error;
    }
  },

  // 4. NUEVO: Crear una reserva (Soporta Temporario y Residencial)
  async createReservation(
    token: string, 
    payload: { propertyId: string; startDate?: string; endDate?: string; months?: number }
  ) {
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Si el backend envía un array de errores de validación, los unimos
        const serverMessage = Array.isArray(errorData.message) 
          ? errorData.message.join(', ') 
          : errorData.message;
        throw new Error(serverMessage || 'Error al crear la reserva');
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error en createReservation:", error);
      throw error;
    }
  }
};