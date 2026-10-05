const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const userService = {
  async updateProfile(userId: string, token: string, data: { name: string; address: string }) {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar el perfil');
    return await response.json();
  },

  async uploadPhoto(file: File, token: string) {
    const formData = new FormData();
    formData.append('photo', file); 

    const response = await fetch(`${API_URL}/users/upload-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ATENCIÓN: No pongas 'Content-Type': 'multipart/form-data', el navegador lo calcula solo al enviar FormData
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Error al subir la imagen');
    return await response.json(); 
  }
};