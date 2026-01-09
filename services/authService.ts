import { Role, User, UserStatus, AuthResponse, Doctor } from '../types';

// INITIAL MOCK DATA
const INITIAL_USERS: User[] = [
  {
    id: 'p1',
    name: 'John Doe',
    email: 'patient@medicore.com',
    role: Role.PATIENT,
    status: UserStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    phone: '+1 (555) 123-4567',
    address: '123 Health St, Wellness City, NY',
    gender: 'Male',
    dob: '1985-04-12',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      twoFactorEnabled: false,
      darkMode: false,
      language: 'English'
    },
    medicalProfile: {
      height: '180 cm',
      weight: '75 kg',
      bloodGroup: 'O+',
      allergies: ['Peanuts', 'Penicillin'],
      conditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      emergencyContact: 'Jane Doe (+1 555-987-6543)'
    }
  },
  {
    id: 'd1',
    name: 'Dr. Sarah Bennett',
    email: 'doctor@medicore.com',
    role: Role.DOCTOR,
    status: UserStatus.ACTIVE,
    specialization: 'Cardiologist',
    experience: 12,
    rating: 4.9,
    availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM'],
    location: 'New York, NY',
    hospital: 'City General Hospital',
    avatar: 'https://picsum.photos/200/200?random=1',
    licenseNumber: 'MD-NY-123456',
    consultationFee: 150,
    verificationStatus: 'VERIFIED',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      twoFactorEnabled: true,
      darkMode: false,
      language: 'English'
    }
  } as Doctor, 
  {
    id: 'a1',
    name: 'Admin System',
    email: 'admin@medicore.com',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      twoFactorEnabled: true,
      darkMode: true,
      language: 'English'
    }
  }
];

const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem('medicore_users', JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users", e);
  }
};

// Helper to access DB
const getUsers = (): User[] => {
  const stored = localStorage.getItem('medicore_users');
  let users: User[] = [];
  
  try {
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    }
  } catch (e) {
    console.warn("Corrupt user data found in storage, resetting.", e);
    users = [];
  }

  // Ensure INITIAL_USERS always exist
  let hasChanges = false;
  INITIAL_USERS.forEach(initUser => {
    // Check if user exists (case-insensitive email check)
    if (!users.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
      users.push(initUser);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveUsers(users);
  }

  return users;
};

const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Date.now() + 3600 * 1000 
  };
  return btoa(JSON.stringify(payload));
};

export const login = async (email: string, password?: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate net lag

  const cleanEmail = email.trim().toLowerCase();
  let users = getUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // FAILSAFE: If user is not found, check if it's a demo account and force recovery
  if (!user) {
    const demoUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (demoUser) {
      users.push(demoUser);
      saveUsers(users);
      user = demoUser;
    }
  }

  if (!user) {
    throw new Error('User not found. Please check your credentials.');
  }

  // Password Validation
  if (password) {
    // 1. If user has a specific stored password (from Signup), validate against it
    if (user.password) {
      if (user.password !== password) {
        throw new Error('Invalid password.');
      }
    } 
    // 2. If no stored password (Demo Accounts), validate against default demo passwords
    else {
      if (password !== 'password123' && password !== 'admin123') {
        throw new Error('Invalid password. For demo accounts use: password123');
      }
    }
  }

  // STATUS CHECKS (Critical for Security)
  if (user.status === UserStatus.BLOCKED) {
    throw new Error('Access Denied: Your account has been blocked by the administrator.');
  }

  if (user.status === UserStatus.PENDING) {
    throw new Error('Account Pending: Your doctor registration is under review by the administration.');
  }

  const token = generateToken(user);
  return { user, token };
};

export const register = async (userData: Partial<User & Doctor>): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
    throw new Error('Email is already registered.');
  }

  // RULE: Doctors are PENDING by default. Patients are ACTIVE by default.
  const initialStatus = userData.role === Role.DOCTOR ? UserStatus.PENDING : UserStatus.ACTIVE;

  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name || 'New User',
    email: userData.email!,
    role: userData.role!,
    status: initialStatus,
    avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      twoFactorEnabled: false,
      darkMode: false,
      language: 'English'
    },
    ...userData // This now includes password
  };

  users.push(newUser);
  saveUsers(users);

  // Even if pending, we return the user object so the UI can show the "Success but Pending" screen
  // However, we might NOT want to return a valid token for pending users to prevent auto-login
  const token = initialStatus === UserStatus.ACTIVE ? generateToken(newUser) : '';
  
  return { user: newUser, token };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) throw new Error("User not found");

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveUsers(users);
  
  return updatedUser;
};

export const getAllUsers = async (): Promise<User[]> => {
    return getUsers();
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