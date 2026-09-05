export type User = {
  id: number;
  name: string;
  email: string;
};

export type Destination = {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  description: string | null;
  imageUrl: string | null;
  category?: string | null;
  location?: string | null;
  createdAt?: string | null;
};

export type Trip = {
  id: number;
  title: string;
  userId: number;
  userEmail?: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  budget?: number | null;
  notes?: string | null;
  createdAt?: string | null;
};

export type CreateTripRequest = {
  title: string;
  destinationId: number;
  startDate: string;
  endDate: string;
  budget?: number | null;
  notes?: string | null;
};

export type UpdateTripRequest = CreateTripRequest;

export type ItineraryDay = {
  id: number;
  tripId: number;
  dayNumber: number;
  date: string | null;
  title: string;
  description: string | null;
};

export type CreateItineraryDayRequest = {
  dayNumber: number;
  date?: string | null;
  title: string;
  description?: string | null;
};

export type UpdateItineraryDayRequest = CreateItineraryDayRequest;

export type Activity = {
  id: number;
  itineraryDayId: number;
  name: string;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type CreateActivityRequest = {
  name: string;
  description?: string | null;
  location?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type UpdateActivityRequest = CreateActivityRequest;

export type WeatherInfo = {
  temperature: number;
  condition: string;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
  locationName?: string;
};

export type PlaceInfo = {
  id: string;
  name: string;
  category?: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
};

export type ExpenseCategory =
  | "TRANSPORTATION"
  | "HOTEL"
  | "FOOD"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "MISCELLANEOUS";

export type Expense = {
  id: number;
  tripId: number;
  budgetId?: number | null;
  payerId?: number | null;
  payerName?: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  receiptLink?: string | null;
  createdAt?: string | null;
};

export type CreateExpenseRequest = {
  category: ExpenseCategory;
  amount: number;
  date: string;
  receiptLink?: string | null;
  payerId?: number | null;
};

export type UpdateExpenseRequest = CreateExpenseRequest;

export type CategorySummary = {
  category: ExpenseCategory;
  totalAmount: number;
};

export type RemainingBudget = {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
};

export type BudgetOverview = {
  totalBudgeted: number;
  totalSpent: number;
};

export type DestinationVisitStats = {
  destination: string;
  visitCount: number;
};

export type TravelStats = {
  totalTripsTaken: number;
  totalDestinationsVisited: number;
  totalAmountSpent: number;
};

export type TravelerDashboard = {
  upcomingTrips: Trip[];
  budgetOverview: BudgetOverview;
  expenseSummary: CategorySummary[];
  destinations: DestinationVisitStats[];
  travelStats: TravelStats;
};

export type UserAnalytics = {
  totalUsers: number;
};

export type TripAnalytics = {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
};

export type DestinationAnalytics = {
  destination: string;
  tripCount: number;
};

export type PlatformStats = {
  totalExpenses: number;
  totalNotificationsSent: number;
};

export type AdminDashboard = {
  userAnalytics: UserAnalytics;
  tripAnalytics: TripAnalytics;
  destinationAnalytics: DestinationAnalytics[];
  platformStats: PlatformStats;
};


