// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'practitioner' | 'admin';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient extends User {
  role: 'patient';
  medicalHistory?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  currentTreatments?: Treatment[];
}

export interface Practitioner extends User {
  role: 'practitioner';
  specialization: string[];
  experience: number;
  qualifications: string[];
  licenseNumber: string;
  patients?: Patient[];
}

// Treatment and Therapy types
export interface Therapy {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'detox' | 'rejuvenation' | 'healing';
  precautions?: string[];
  benefits?: string[];
  contraindications?: string[];
}

export interface Treatment {
  id: string;
  patientId: string;
  practitionerId: string;
  therapies: Therapy[];
  startDate: string;
  endDate?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  sessions: Session[];
}

export interface Session {
  id: string;
  treatmentId: string;
  therapyId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled';
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  feedback?: SessionFeedback;
}

// Feedback types
export interface SessionFeedback {
  id: string;
  sessionId: string;
  patientId: string;
  rating: number; // 1-5
  symptoms?: string[];
  sideEffects?: string[];
  improvements?: string[];
  overallFeeling: 'excellent' | 'good' | 'average' | 'poor' | 'very-poor';
  comments?: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'reminder' | 'alert' | 'update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
  actionUrl?: string;
}

// Analytics and Progress types
export interface ProgressMetric {
  date: string;
  value: number;
  metric: 'energy' | 'stress' | 'sleep' | 'pain' | 'mood' | 'overall';
}

export interface TreatmentProgress {
  treatmentId: string;
  completedSessions: number;
  totalSessions: number;
  metrics: ProgressMetric[];
  milestones: {
    date: string;
    description: string;
    achieved: boolean;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'practitioner';
  phone?: string;
  dateOfBirth?: string;
}

export interface AppointmentForm {
  therapyId: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}