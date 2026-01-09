export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED'
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorEnabled: boolean;
  darkMode: boolean;
  language: string;
}

export interface MedicalProfile {
  height: string;
  weight: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string; // Added for mock auth storage
  phone?: string;
  address?: string;
  gender?: string;
  dob?: string;
  status: UserStatus;
  avatar?: string;
  preferences?: UserPreferences;
  medicalProfile?: MedicalProfile; // Only for Patients
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  rating: number;
  availableSlots: string[];
  location: string;
  hospital: string;
  licenseNumber?: string; // Critical for verification
  consultationFee?: number;
  bio?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName?: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'IN_PERSON' | 'VIDEO';
  paymentStatus?: 'PAID' | 'PENDING';
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  date: string;
  medications: { name: string; dosage: string; frequency: string }[];
  instructions: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'LAB_REPORT' | 'XRAY' | 'PRESCRIPTION' | 'HISTORY';
  title: string;
  summary?: string;
  fileUrl?: string;
  doctorName?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isAnalysis?: boolean;
}

export interface EmergencyLog {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  location: string;
  timestamp: string;
  status: 'DISPATCHED' | 'RESOLVED';
}