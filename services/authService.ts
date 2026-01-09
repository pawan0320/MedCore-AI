import { Role, User, UserStatus, AuthResponse, Doctor } from '../types';

// INITIAL MOCK DATA
const INITIAL_USERS: User[] = [
  {
    id: 'p1',
    name: 'John Doe',
    email: 'patient@medicore.com',
    role: Role.PATIENT,
    status: UserStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: 'd1',
    name: 'Dr. Sarah Bennett',
    email: 'doctor@medicore.com',
    role: Role.DOCTOR,
    status: UserStatus.ACTIVE,
    specialization: 'Cardiologist', // Type assertion handled in logic
    hospital: 'City General',
    avatar: 'https://picsum.photos/200/200?random=1'
  } as Doctor, 
  {
    id: 'a1',
    name: 'Admin System',
    email: 'admin@medicore.com',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
  }
];

// Helper to access DB
const getUsers = (): User[] => {
  const stored = localStorage.getItem('medicore_users');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('medicore_users', JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('medicore_users', JSON.stringify(users));
};

const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Date.now() + 3600 * 1000 
  };
  return btoa(JSON.stringify(payload));
};

export const login = async (email: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate net lag

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error('User not found');
  }

  // We allow logging in even if PENDING, so the UI can show a "Pending" banner
  if (user.status === UserStatus.BLOCKED) {
    throw new Error('Account is blocked. Contact support.');
  }

  const token = generateToken(user);
  return { user, token };
};

export const register = async (userData: Partial<User & Doctor>): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getUsers();
  if (users.find(u => u.email === userData.email)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name || 'New User',
    email: userData.email!,
    role: userData.role!,
    status: userData.role === Role.DOCTOR ? UserStatus.PENDING : UserStatus.ACTIVE, // Doctors need approval
    avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
    ...userData
  };

  users.push(newUser);
  saveUsers(users);

  const token = generateToken(newUser);
  return { user: newUser, token };
};

export const getPendingDoctors = async (): Promise<User[]> => {
  const users = getUsers();
  return users.filter(u => u.role === Role.DOCTOR && u.status === UserStatus.PENDING);
};

export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
  saveUsers(updatedUsers);
};

export const verifyToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch (e) {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};