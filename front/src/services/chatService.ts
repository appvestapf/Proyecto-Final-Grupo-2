const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const chatService = {
  async sendMessage(message: string) {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Error de conexión con el asistente');
      
      return await response.json(); // Esto devolverá { message: string, properties?: array }
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
};