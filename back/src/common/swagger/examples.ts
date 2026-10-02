// Ejemplos de respuesta para Swagger. Solo documentación: no se usan en la lógica.

const UUID = '3f1c2b7e-8a4d-4f6b-9c2e-1d5a7b9e0c11';

export const USER_EXAMPLE = {
  id: UUID,
  name: 'Sarah Ramirez',
  email: 'sarah@mail.com',
  address: 'Calle Falsa 123, Buenos Aires',
  isAdmin: false,
  isSuperAdmin: false,
  pfp: 'https://res.cloudinary.com/tucuenta/image/upload/users/foto.jpg',
  googleId: null,
  isActive: true,
};

export const PROFILE_EXAMPLE = {
  id: UUID,
  name: 'Sarah Ramirez',
  email: 'sarah@mail.com',
  address: 'Calle Falsa 123, Buenos Aires',
  isAdmin: false,
  isSuperAdmin: false,
  pfp: 'https://res.cloudinary.com/tucuenta/image/upload/users/foto.jpg',
};

export const AUTH_RESPONSE_EXAMPLE = {
  user: USER_EXAMPLE,
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

export const PROPERTY_EXAMPLE = {
  id: '9b2e4c1a-6d3f-4e8a-b7c5-2f1d0e9a8b76',
  name: 'Departamento Palermo',
  description: 'Moderno departamento cerca de todo',
  price: 850,
  priceUnit: 'noche',
  country: 'Argentina',
  city: 'Buenos Aires',
  lat: -34.5889,
  lng: -58.4309,
  rentalType: 'Temporario',
  capacity: 4,
  rooms: 2,
  bathrooms: 1,
  area: 65,
  rating: 4.8,
  isPetFriendly: true,
  hasGarage: false,
  isDeleted: false,
  isAvailable: true,
  images: ['https://res.cloudinary.com/tucuenta/image/upload/properties/1.jpg'],
};

export const PROPERTY_WITH_OWNER_EXAMPLE = {
  ...PROPERTY_EXAMPLE,
  owner: { ...USER_EXAMPLE, isAdmin: true, name: 'Agente Vesta' },
};

export const RESERVATION_EXAMPLE = {
  id: '5d7a9c2e-1b3f-4a6d-8e0c-7f2b4d6a9c13',
  userId: UUID,
  propertyId: PROPERTY_EXAMPLE.id,
  startDate: '2026-10-15',
  endDate: '2026-10-20',
  nights: 5,
  totalPrice: 4250,
  status: 'pending',
  createdAt: '2026-10-01T18:30:00.000Z',
};

export const PAYMENT_EXAMPLE = {
  id: '7e1b3d5f-9a2c-4e6b-8d0a-3c5e7f9b1d24',
  reservationId: RESERVATION_EXAMPLE.id,
  mercadoPagoOrderId: 'ORDTST01K...',
  mercadoPagoPaymentId: '123456789',
  amount: '4250.00',
  status: 'approved',
  createdAt: '2026-10-01T18:35:00.000Z',
  updatedAt: '2026-10-01T18:36:00.000Z',
};

export const APPOINTMENT_EXAMPLE = {
  id: '2c4e6a8b-0d1f-4b3d-9e5a-6b8c0d2e4f35',
  userId: UUID,
  propertyId: PROPERTY_EXAMPLE.id,
  date: '2026-10-10T15:00:00.000Z',
  status: 'pending',
};

export const MESSAGE_EXAMPLE = (message: string) => ({ message });
