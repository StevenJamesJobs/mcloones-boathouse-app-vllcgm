
// User types (legacy - for backward compatibility)
export type UserRole = 'customer' | 'employee' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Employee types (new authentication system)
export interface Employee {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  job_title: string;
  role: 'owner_manager' | 'manager' | 'employee';
  profile_picture_url: string | null;
  tagline: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Menu types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  mealType: 'lunch' | 'dinner' | 'both';
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  rsvpLink: string;
  imageUrl?: string;
}

// Special types
export interface WeeklySpecial {
  id: string;
  title: string;
  description: string;
  price?: number;
  validUntil: string;
}

// Employee types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'image' | 'video';
  url: string;
  category: string;
}

export interface McLoonesBuck {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  date: string;
  awardedBy: string;
}

export interface EmployeeReward {
  employeeId: string;
  employeeName: string;
  totalBucks: number;
}

// Weather type
export interface Weather {
  temperature: number;
  condition: string;
  icon: string;
}
