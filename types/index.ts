
// User types
export type UserRole = 'customer' | 'employee' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
