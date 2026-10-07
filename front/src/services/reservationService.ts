const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface BlockedDateRange {
  startDate: string;
  endDate: string;
}

export interface CreateReservationPayload {
  propertyId: string;
  startDate?: string;
  endDate?: string;
  months?: number;
}

export const reservationService = {
  // Obtener reservas del usuario logueado
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
    } catch (error: unknown) {
      console.error('Error en getMyReservations:', error);
      return [];
    }
  },

  // Obtener fechas bloqueadas de una propiedad (Endpoint público)
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
    } catch (error: unknown) {
      console.error(`Error obteniendo fechas bloqueadas para la propiedad ${propertyId}:`, error);
      return [];
    }
  },

  // Crear una reserva (Soporta Temporario y Residencial)
  async createReservation(token: string, payload: CreateReservationPayload) {
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
        const serverMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
        throw new Error(serverMessage || 'Error al crear la reserva');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error en createReservation:', error);
      throw error;
    }
  },

  // Cancelar una reserva
  async cancelReservation(token: string, reservationId: string) {
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
    } catch (error: unknown) {
      console.error('Error en cancelReservation:', error);
      throw error;
    }
  },

  // Listar todas las reservas (Solo Admin)
  async getAllReservations(token: string, status?: 'pending' | 'confirmed' | 'cancelled') {
    try {
      const query = status ? `?status=${status}` : '';
      const response = await fetch(`${API_URL}/reservations${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al listar las reservas');

      return await response.json();
    } catch (error: unknown) {
      console.error('Error en getAllReservations:', error);
      return [];
    }
  },

  // Obtener métricas del Dashboard (Solo Admin)
  async getAdminMetrics(token: string) {
    try {
      const response = await fetch(`${API_URL}/reservations/admin/metrics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener métricas');
      }

      return data;
    } catch (error: unknown) {
      console.error('Error en getAdminMetrics:', error);
      throw error;
    }
  },
};