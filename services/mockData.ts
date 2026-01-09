import { Doctor, Role, UserStatus, Appointment, Prescription, MedicalRecord } from '../types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Bennett',
    role: Role.DOCTOR,
    email: 'sarah@medicore.com',
    status: UserStatus.ACTIVE,
    specialization: 'Cardiologist',
    experience: 12,
    rating: 4.9,
    hospital: 'City General Hospital',
    location: 'New York, NY',
    availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM'],
    avatar: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'd2',
    name: 'Dr. James Wu',
    role: Role.DOCTOR,
    email: 'james@medicore.com',
    status: UserStatus.ACTIVE,
    specialization: 'Dermatologist',
    experience: 8,
    rating: 4.7,
    hospital: 'Downtown Clinic',
    location: 'San Francisco, CA',
    availableSlots: ['11:00 AM', '03:00 PM', '04:30 PM'],
    avatar: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'd3',
    name: 'Dr. Emily Carter',
    role: Role.DOCTOR,
    email: 'emily@medicore.com',
    status: UserStatus.ACTIVE,
    specialization: 'Pediatrician',
    experience: 15,
    rating: 5.0,
    hospital: 'Children\'s Health Center',
    location: 'Chicago, IL',
    availableSlots: ['08:30 AM', '01:00 PM'],
    avatar: 'https://picsum.photos/200/200?random=3'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    doctorId: 'd1',
    doctorName: 'Dr. Sarah Bennett',
    patientId: 'p1',
    patientName: 'John Doe',
    date: '2024-03-20',
    time: '09:00 AM',
    status: 'CONFIRMED',
    type: 'VIDEO',
    paymentStatus: 'PAID'
  },
  {
    id: 'a2',
    doctorId: 'd2',
    doctorName: 'Dr. James Wu',
    patientId: 'p1',
    patientName: 'John Doe',
    date: '2024-03-22',
    time: '02:30 PM',
    status: 'COMPLETED',
    type: 'IN_PERSON',
    paymentStatus: 'PAID'
  }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pr1',
    appointmentId: 'a2',
    doctorId: 'd2',
    doctorName: 'Dr. James Wu',
    patientId: 'p1',
    date: '2024-03-22',
    medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily' },
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily' }
    ],
    instructions: 'Take with food. Complete the full course.'
  }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'r1',
    patientId: 'p1',
    date: '2024-01-15',
    type: 'LAB_REPORT',
    title: 'Complete Blood Count (CBC)',
    summary: 'Normal range. Hemoglobin slightly low.',
    doctorName: 'LabCorp'
  },
  {
    id: 'r2',
    patientId: 'p1',
    date: '2024-03-22',
    type: 'PRESCRIPTION',
    title: 'Dermatology Prescription',
    summary: 'Prescribed antibiotics for skin infection.',
    doctorName: 'Dr. James Wu'
  }
];

export const MOCK_STATS = [
  { name: 'Mon', appointments: 12, emergencies: 2 },
  { name: 'Tue', appointments: 19, emergencies: 1 },
  { name: 'Wed', appointments: 15, emergencies: 4 },
  { name: 'Thu', appointments: 22, emergencies: 3 },
  { name: 'Fri', appointments: 28, emergencies: 5 },
  { name: 'Sat', appointments: 14, emergencies: 8 },
  { name: 'Sun', appointments: 8, emergencies: 6 },
];