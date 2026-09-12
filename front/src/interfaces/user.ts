export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  address: string;
  isAdmin: boolean;
  pfp?: string | null;
}