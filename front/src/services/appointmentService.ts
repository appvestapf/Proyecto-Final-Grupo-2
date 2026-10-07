const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const appointmentService = {
  // Crear una nueva visita presencial
  async createAppointment(token: string, propertyId: string, date: string) {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId, date }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agendar la visita');
      }

      return data;
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Error de conexión';
      throw new Error(errMessage);
    }
  },

  // Obtener la lista de citas del usuario
  async getMyAppointments(token: string) {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al obtener las citas');

      return await response.json();
    } catch (error: unknown) {
      console.error('Error en getMyAppointments:', error);
      return [];
    }
  },

  // Cancelar una cita
  async cancelAppointment(appointmentId: string, token: string) {
    try {
      if (!token) {
        throw new Error('Token de autenticación no encontrado. Inicie sesión nuevamente.');
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar la visita');
      }

      return data;
    } catch (error: unknown) {
      console.error('Error en cancelAppointment:', error);
      throw error;
    }
  },

  // Reprogramar una cita
  async rescheduleAppointment(token: string, appointmentId: string, newDate: string) {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Error al reprogramar la visita');
      }

      return data;
    } catch (error: unknown) {
      console.error('Error en rescheduleAppointment:', error);
      throw error;
    }
  },

  // Confirmar una cita (dueño o admin)
  async confirmAppointment(token: string, appointmentId: string) {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Error al confirmar la visita');
      }

      return data;
    } catch (error: unknown) {
      console.error('Error en confirmAppointment:', error);
      throw error;
    }
  },
};