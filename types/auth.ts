export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  image?: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthError {
  message: string;
  status: number;
}
