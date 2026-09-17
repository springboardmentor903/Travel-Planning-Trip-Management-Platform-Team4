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

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  name: string;
  email: string;
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

export type Activity = {
  id: number;
  itineraryDayId: number;
  name: string;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type ItineraryDay = {
  id: number;
  tripId: number;
  dayNumber: number;
  date: string | null;
  title: string;
  description: string | null;
  activities?: Activity[];
};

export type CreateItineraryDayRequest = {
  dayNumber: number;
  date?: string | null;
  title: string;
  description?: string | null;
};

export type UpdateItineraryDayRequest = CreateItineraryDayRequest;

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

export type MemberBalance = {
  userId: number;
  userName: string;
  userEmail: string;
  amountPaid: number;
  shouldPay: number;
  netBalance: number;
};

export type SettlementTransaction = {
  id: number;
  tripId: number;
  fromUserId: number;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: number;
  toUserName: string;
  toUserEmail: string;
  amount: number;
  status: "PENDING" | "SETTLED";
  createdAt: string;
  settledAt?: string | null;
};

export type SettlementSummaryResponse = {
  tripId: number;
  totalExpenses: number;
  memberCount: number;
  equalShare: number;
  currency: string;
  memberBalances: MemberBalance[];
  pendingSettlements: SettlementTransaction[];
  settledTransactions: SettlementTransaction[];
};

export type PackingCategory =
  | "CLOTHING"
  | "RAIN_PROTECTION"
  | "FOOTWEAR"
  | "HEALTH"
  | "DOCUMENTS"
  | "ELECTRONICS"
  | "ACCESSORIES"
  | "OTHER";

export type PackingItem = {
  id: number;
  tripId: number;
  name: string;
  category: PackingCategory;
  packed: boolean;
  custom: boolean;
  reason?: string | null;
};

export type PackingChecklistResponse = {
  tripId: number;
  weatherCondition?: string | null;
  temperature?: number | null;
  weatherAvailable: boolean;
  weatherSummary: string;
  totalItems: number;
  packedItems: number;
  items: PackingItem[];
};

export type NotificationType =
  | "MEMBER_ADDED"
  | "JOIN_REQUEST"
  | "JOIN_REQUEST_APPROVED"
  | "JOIN_REQUEST_REJECTED"
  | "EXPENSE_ADDED"
  | "TRIP_UPDATED"
  | string;

export type Notification = {
  id: number;
  recipientId?: number;
  userId?: number;
  title?: string;
  message: string;
  type?: NotificationType;
  relatedTripId?: number;
  isRead?: boolean;
  read?: boolean;
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

export type ComprehensiveAnalyticsResponse = any;

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

export type MembershipRole = "GROUP_ADMIN" | "MEMBER";

export type TripMemberResponse = {
  id?: number;
  membershipId?: number;
  tripId?: number;
  userId: number;
  name: string;
  email: string;
  role: MembershipRole;
  createdAt?: string;
};

export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type JoinRequestResponse = {
  requestId: number;
  tripId: number;
  tripTitle: string;
  userId: number;
  name: string;
  email: string;
  status: JoinRequestStatus;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedById?: number | null;
  reviewedByName?: string | null;
};

export type RecommendedPlace = {
  name: string;
  category?: string;
  description?: string;
  location?: string;
  estimatedDuration?: string;
  recommendedTime?: string;
  estimatedCost?: string;
  popularity?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type DestinationRecommendationResponse = {
  tripId: number;
  destinationId: number;
  destinationName: string;
  country?: string;
  city?: string;
  recommendationsByCategory?: Record<string, RecommendedPlace[]>;
  allRecommendations?: RecommendedPlace[];
};

export type SmartItineraryRequest = {
  travelStyle?: string;
  interests?: string[];
  budgetPreference?: string;
  pace?: string;
  preferredStartTime?: string;
  foodPreference?: string;
  transportationPreference?: string;
};

export type ItinerarySuggestionResponse = {
  tripId: number;
  destinationName?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  totalBudget?: number;
  tripOverview?: string;
  dailyStrategy?: any[];
  itinerary?: any[];
  recommendations?: RecommendedPlace[];
  planningTips?: string[];
  warnings?: string[];
  budgetInsights?: any;
};

export type ApplyItinerarySuggestionsRequest = {
  days?: any[];
};

export type TripSearchResponse = {
  id: number;
  title: string;
  destinationName?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: number;
  ownerName?: string;
};
