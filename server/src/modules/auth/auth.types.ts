export interface User {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
}

export type UserPublic = Omit<User, 'password'>;

export type UserLogin = Pick<User, 'id' | 'fullname' | 'email' | 'password' | 'role'>;