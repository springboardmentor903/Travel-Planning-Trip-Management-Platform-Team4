export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type GoogleAuthRequest = {
  token: string;
};


export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  role?: string;
  message: string;
  token: string | null;
};

export type Destination = {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  description: string | null;
  imageUrl: string | null;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  createdAt?: string | null;
};

export type TripStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export type Trip = {
  id: number;
  title: string;
  userId?: number;
  userEmail?: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  budget?: number | null;
  notes?: string | null;
  status: TripStatus;
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

export type PlaceItemResponse = {
  id: string;
  name: string;
  category?: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
};

export type PlaceInfo = PlaceItemResponse;

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
  tripTitle?: string | null;
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

export type Notification = {
  id: number;
  userId?: number;
  message: string;
  eventKey?: string | null;
  createdAt: string;
  userEmail?: string | null;
};

export type AdminUserSummary = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type TripAnalytics = {
  totalTrips: number;
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageBudget: number;
};

export type TripMonthlyCount = {
  month: string;
  count: number;
};

export type DestinationAnalytics = {
  destinationId: number;
  destinationName: string;
  tripCount: number;
};

export type PlatformStats = {
  totalExpenses: number;
  totalNotifications: number;
};

export type AdminAnalyticsResponse = {
  totalUsers: number;
  tripAnalytics: TripAnalytics;
  popularDestinations: DestinationAnalytics[];
  platformStats: PlatformStats;
  tripsOverTime?: TripMonthlyCount[];
};

export type TripAdminDTO = {
  id: number;
  title: string;
  userId: number;
  userName: string;
  userEmail: string;
  destinationId: number;
  destinationName: string;
  destinationCountry: string;
  destinationImageUrl: string;
  startDate: string;
  endDate: string;
  budget?: number | null;
  notes?: string | null;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  derivedStatus: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

export type TripAdminDetailsDTO = {
  id: number;
  title: string;
  userId: number;
  userName: string;
  userEmail: string;
  userRole?: string;
  userActive?: boolean;
  userOauthGoogle?: boolean;
  destination: Destination;
  startDate: string;
  endDate: string;
  budget?: number | null;
  notes?: string | null;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  derivedStatus: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

export type UserAdminDTO = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  oauthGoogle: boolean;
  createdAt: string | null;
  tripCount: number;
};

export type UserDetailsDTO = UserAdminDTO & {
  totalPlannedBudget: number;
  recentTrips: Trip[];
};

export type UserStatsResponse = {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  adminCount: number;
  travelerCount: number;
  newUsersThisMonth: number;
};

export type DestinationAdminDTO = {
  id: number;
  name: string;
  country: string;
  city?: string | null;
  description: string;
  imageUrl: string;
  category: string;
  latitude: number;
  longitude: number;
  active: boolean;
  estimatedBudget?: number | null;
  bestTravelSeason?: string | null;
  tripCount: number;
};

export type CreateDestinationRequest = {
  name: string;
  country: string;
  city?: string;
  description: string;
  imageUrl?: string;
  category: string;
  latitude: number;
  longitude: number;
  active?: boolean;
  estimatedBudget?: number;
  bestTravelSeason?: string;
};

export type DestinationStatsResponse = {
  totalDestinations: number;
  activeDestinations: number;
  inactiveDestinations: number;
  mostPopularDestinationName: string;
  mostPopularDestinationTripCount: number;
  categoryDistribution: Record<string, number>;
};

export type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type UserTrendDTO = {
  period: string;
  count: number;
};

export type CategoryDistributionDTO = {
  category: string;
  count: number;
  percentage: number;
};

export type BudgetRangeBucket = {
  rangeLabel: string;
  tripCount: number;
  percentage: number;
};

export type BudgetAnalyticsDTO = {
  averageBudget: number;
  minBudget: number;
  maxBudget: number;
  totalPlannedBudget: number;
  rangeDistribution: BudgetRangeBucket[];
};

export type DateAnalyticsDTO = {
  averageTripDurationDays: number;
  popularTravelMonths: { monthName: string; tripCount: number }[];
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  cancelledTrips: number;
};

export type UserAnalyticsDTO = {
  totalUsers: number;
  newUsersInPeriod: number;
  activeUsers: number;
  travelerCount: number;
  adminCount: number;
  registrationTrend: UserTrendDTO[];
};

export type DestinationShareDTO = {
  destinationId: number;
  destinationName: string;
  tripCount: number;
  percentageShare: number;
};

export type ComprehensiveAnalyticsResponse = {
  kpi: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    totalTrips: number;
    tripsThisMonth: number;
    totalDestinations: number;
    activeDestinations: number;
    averageTripBudget: number;
  };
  userAnalytics: UserAnalyticsDTO;
  tripAnalytics: {
    totalTrips: number;
    upcomingTrips: number;
    ongoingTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    tripsOverTime: { month: string; count: number }[];
  };
  destinationAnalytics: {
    totalDestinations: number;
    activeDestinations: number;
    topDestinations: DestinationShareDTO[];
    categoryDistribution: CategoryDistributionDTO[];
  };
  budgetAnalytics: BudgetAnalyticsDTO;
  dateAnalytics: DateAnalyticsDTO;
};



