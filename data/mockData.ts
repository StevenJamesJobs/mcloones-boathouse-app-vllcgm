
import { MenuItem, Event, WeeklySpecial, Announcement, Shift, TrainingMaterial, McLoonesBuck, EmployeeReward, User } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', email: 'manager@mcloones.com', name: 'John Manager', role: 'manager' },
  { id: '2', email: 'employee@mcloones.com', name: 'Jane Employee', role: 'employee' },
];

// Mock Menu Items - Lunch
export const lunchMenuItems: MenuItem[] = [
  {
    id: 'l1',
    name: 'Classic Burger',
    description: 'Angus beef patty with lettuce, tomato, onion, and special sauce',
    price: 14.99,
    category: 'Burgers',
    mealType: 'lunch',
  },
  {
    id: 'l2',
    name: 'Grilled Chicken Sandwich',
    description: 'Marinated chicken breast with avocado and chipotle mayo',
    price: 13.99,
    category: 'Sandwiches',
    mealType: 'lunch',
  },
  {
    id: 'l3',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons, and Caesar dressing',
    price: 11.99,
    category: 'Salads',
    mealType: 'lunch',
  },
  {
    id: 'l4',
    name: 'Fish Tacos',
    description: 'Grilled mahi-mahi with cabbage slaw and lime crema',
    price: 15.99,
    category: 'Tacos',
    mealType: 'lunch',
  },
  {
    id: 'l5',
    name: 'Soup of the Day',
    description: 'Ask your server for today&apos;s selection',
    price: 7.99,
    category: 'Soups',
    mealType: 'lunch',
  },
];

// Mock Menu Items - Dinner
export const dinnerMenuItems: MenuItem[] = [
  {
    id: 'd1',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce, seasonal vegetables',
    price: 26.99,
    category: 'Seafood',
    mealType: 'dinner',
  },
  {
    id: 'd2',
    name: 'Filet Mignon',
    description: '8oz center-cut filet with garlic mashed potatoes',
    price: 34.99,
    category: 'Steaks',
    mealType: 'dinner',
  },
  {
    id: 'd3',
    name: 'Lobster Ravioli',
    description: 'Homemade ravioli stuffed with lobster in cream sauce',
    price: 28.99,
    category: 'Pasta',
    mealType: 'dinner',
  },
  {
    id: 'd4',
    name: 'Seafood Platter',
    description: 'Shrimp, scallops, and calamari with cocktail sauce',
    price: 32.99,
    category: 'Seafood',
    mealType: 'dinner',
  },
  {
    id: 'd5',
    name: 'Chicken Marsala',
    description: 'Pan-seared chicken breast with mushroom marsala sauce',
    price: 22.99,
    category: 'Entrees',
    mealType: 'dinner',
  },
  {
    id: 'd6',
    name: 'Vegetarian Risotto',
    description: 'Creamy arborio rice with seasonal vegetables',
    price: 19.99,
    category: 'Vegetarian',
    mealType: 'dinner',
  },
];

// Mock Weekly Specials
export const weeklySpecials: WeeklySpecial[] = [
  {
    id: 's1',
    title: 'Taco Tuesday',
    description: '$2 off all tacos and margaritas',
    validUntil: '2024-12-31',
  },
  {
    id: 's2',
    title: 'Weekend Brunch',
    description: 'Bottomless mimosas with any brunch entree',
    price: 25.99,
    validUntil: '2024-12-31',
  },
  {
    id: 's3',
    title: 'Happy Hour',
    description: 'Half-price appetizers and drinks 4-6pm weekdays',
    validUntil: '2024-12-31',
  },
];

// Mock Events
export const upcomingEvents: Event[] = [
  {
    id: 'e1',
    title: 'Live Jazz Night',
    description: 'Enjoy live jazz music every Friday night from 7-10pm',
    date: '2024-12-20',
    time: '7:00 PM',
    rsvpLink: 'https://example.com/rsvp/jazz',
  },
  {
    id: 'e2',
    title: 'Wine Tasting Event',
    description: 'Sample premium wines from local vineyards',
    date: '2024-12-22',
    time: '6:00 PM',
    rsvpLink: 'https://example.com/rsvp/wine',
  },
  {
    id: 'e3',
    title: 'New Year&apos;s Eve Celebration',
    description: 'Ring in the new year with a special 5-course menu',
    date: '2024-12-31',
    time: '8:00 PM',
    rsvpLink: 'https://example.com/rsvp/nye',
  },
  {
    id: 'e4',
    title: 'Sunday Brunch with Santa',
    description: 'Bring the kids for brunch and photos with Santa',
    date: '2024-12-15',
    time: '10:00 AM',
    rsvpLink: 'https://example.com/rsvp/santa',
  },
];

// Mock Announcements
export const announcements: Announcement[] = [
  {
    id: 'a1',
    title: 'Holiday Schedule',
    message: 'Please check the updated holiday schedule. We will be closed on Christmas Day.',
    date: '2024-12-10',
    priority: 'high',
  },
  {
    id: 'a2',
    title: 'New Menu Items',
    message: 'We&apos;ve added three new items to the dinner menu. Please familiarize yourself with them.',
    date: '2024-12-08',
    priority: 'medium',
  },
  {
    id: 'a3',
    title: 'Team Meeting',
    message: 'Monthly team meeting scheduled for next Monday at 3pm.',
    date: '2024-12-05',
    priority: 'low',
  },
];

// Mock Shifts
export const upcomingShifts: Shift[] = [
  {
    id: 'sh1',
    employeeId: '2',
    date: '2024-12-15',
    startTime: '5:00 PM',
    endTime: '11:00 PM',
    position: 'Server',
  },
  {
    id: 'sh2',
    employeeId: '2',
    date: '2024-12-16',
    startTime: '5:00 PM',
    endTime: '11:00 PM',
    position: 'Server',
  },
  {
    id: 'sh3',
    employeeId: '2',
    date: '2024-12-18',
    startTime: '11:00 AM',
    endTime: '5:00 PM',
    position: 'Server',
  },
];

// Mock Training Materials
export const trainingMaterials: TrainingMaterial[] = [
  {
    id: 't1',
    title: 'Employee Handbook',
    description: 'Complete guide to policies and procedures',
    type: 'pdf',
    url: 'https://example.com/handbook.pdf',
    category: 'General',
  },
  {
    id: 't2',
    title: 'Food Safety Guide',
    description: 'Essential food safety and handling procedures',
    type: 'pdf',
    url: 'https://example.com/food-safety.pdf',
    category: 'Safety',
  },
  {
    id: 't3',
    title: 'POS System Tutorial',
    description: 'How to use the point-of-sale system',
    type: 'pdf',
    url: 'https://example.com/pos-tutorial.pdf',
    category: 'Technology',
  },
  {
    id: 't4',
    title: 'Menu Cheat Sheet',
    description: 'Quick reference for all menu items and ingredients',
    type: 'image',
    url: 'https://example.com/menu-cheat-sheet.jpg',
    category: 'Menu',
  },
];

// Mock McLoone's Bucks
export const mcLoonesBucks: McLoonesBuck[] = [
  {
    id: 'mb1',
    employeeId: '2',
    employeeName: 'Jane Employee',
    amount: 50,
    reason: 'Great Customer Review',
    date: '2024-12-10',
    awardedBy: 'John Manager',
  },
  {
    id: 'mb2',
    employeeId: '2',
    employeeName: 'Jane Employee',
    amount: 25,
    reason: 'Perfect Weekly Attendance',
    date: '2024-12-08',
    awardedBy: 'John Manager',
  },
  {
    id: 'mb3',
    employeeId: '3',
    employeeName: 'Bob Server',
    amount: 100,
    reason: 'Employee of the Month',
    date: '2024-12-01',
    awardedBy: 'John Manager',
  },
  {
    id: 'mb4',
    employeeId: '4',
    employeeName: 'Alice Cook',
    amount: 75,
    reason: 'Outstanding Service',
    date: '2024-12-05',
    awardedBy: 'John Manager',
  },
  {
    id: 'mb5',
    employeeId: '5',
    employeeName: 'Charlie Host',
    amount: 50,
    reason: 'Great Teamwork',
    date: '2024-12-07',
    awardedBy: 'John Manager',
  },
];

// Mock Employee Rewards (Top 5)
export const topEmployees: EmployeeReward[] = [
  { employeeId: '3', employeeName: 'Bob Server', totalBucks: 325 },
  { employeeId: '4', employeeName: 'Alice Cook', totalBucks: 275 },
  { employeeId: '5', employeeName: 'Charlie Host', totalBucks: 200 },
  { employeeId: '2', employeeName: 'Jane Employee', totalBucks: 175 },
  { employeeId: '6', employeeName: 'David Bartender', totalBucks: 150 },
];

// Contact Information - Updated with correct McLoone's Boathouse info
export const contactInfo = {
  phone: '(732) 872-1245',
  email: 'info@mcloones.com',
  address: '1 Ocean Avenue, West End, NJ 07740',
  hours: {
    weekday: '11:30 AM - 9:00 PM',
    weekend: '10:00 AM - 9:00 PM',
  },
};

// About Us Content
export const aboutUsContent = {
  title: 'About McLoone&apos;s Boathouse',
  description: 'McLoone&apos;s Boathouse is located on the Shrewsbury River in West End, New Jersey. We offer stunning waterfront views, exceptional cuisine, and a warm, welcoming atmosphere that has made us a favorite destination for locals and visitors alike.',
  mission: 'To provide an unforgettable dining experience that combines exceptional food, breathtaking views, and warm hospitality.',
  history: 'Founded by Tim McLoone, our restaurant has grown to become one of the premier dining destinations on the Jersey Shore. We take pride in our commitment to fresh, locally-sourced ingredients and outstanding service.',
};
