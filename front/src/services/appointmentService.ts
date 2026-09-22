const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const appointmentService = {
  // 1. Para cuando el usuario hace clic en "Agendar Visita" en el catálogo
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agendar la visita');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // 2. Para mostrar la lista de visitas en la pestaña "Mis Visitas"
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
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};