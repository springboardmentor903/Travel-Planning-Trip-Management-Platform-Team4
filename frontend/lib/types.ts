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
  activities?: Activity[];
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

export type MembershipRole = "MEMBER" | "GROUP_ADMIN";

export type TripMemberResponse = {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: MembershipRole;
  joinedAt?: string | null;
};

export type AddTripMemberRequest = {
  email: string;
};

export type ChangeMemberRoleRequest = {
  role: MembershipRole;
};

export type TripSearchResponse = {
  id: number;
  title: string;
  destinationName?: string | null;
  country?: string | null;
  startDate: string;
  endDate: string;
  ownerId: number;
  ownerName: string;
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

export type NotificationType =
  | "JOIN_REQUEST_CREATED"
  | "JOIN_REQUEST_APPROVED"
  | "JOIN_REQUEST_REJECTED"
  | "MEMBER_ADDED"
  | "EXPENSE_ADDED"
  | "TRIP_UPDATED";

export type Notification = {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  title?: string;
  recipientId?: number;
  relatedTripId?: number | null;
  read?: boolean;
};

export type NotificationUnreadCount = {
  count: number;
  unreadCount?: number;
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

export type SuggestedActivity = {
  name: string;
  description: string;
  location: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  estimatedDuration?: string;
  estimatedCost?: string;
};

export type SuggestedDay = {
  dayNumber: number;
  date?: string;
  title: string;
  description: string;
  activities: SuggestedActivity[];
};

export type SmartItineraryResponse = {
  tripId: number;
  destinationName: string;
  totalDays: number;
  suggestedDays: SuggestedDay[];
};

export type DailyStrategy = {
  dayNumber: number;
  theme: string;
  strategy: string;
};

export type BudgetInsights = {
  estimatedDailyBudget: string;
  accommodationCost: string;
  foodCost: string;
  transportationCost: string;
  activitiesCost: string;
  totalEstimatedCost: string;
  budgetMessage: string;
};

export type ItinerarySuggestionResponse = {
  tripId: number;
  destinationName: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  totalDays: number;
  totalBudget?: number;
  tripOverview?: string;
  dailyStrategy?: DailyStrategy[];
  itinerary: SuggestedDay[];
  recommendations: RecommendedPlace[];
  planningTips: string[];
  warnings?: string[];
  budgetInsights?: BudgetInsights;
};

export type RecommendedPlace = {
  name: string;
  category: string;
  description: string;
  location: string;
  estimatedDuration: string;
  recommendedTime: string;
  estimatedCost: string;
  popularity: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type ApplyActivityRequest = {
  title?: string;
  name?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
};

export type ApplyItineraryDayRequest = {
  dayNumber: number;
  date?: string;
  title?: string;
  description?: string;
  activities?: ApplyActivityRequest[];
};

export type ApplyItinerarySuggestionsRequest = {
  days: ApplyItineraryDayRequest[];
};

export type DestinationRecommendationResponse = {
  tripId: number;
  destinationId: number;
  destinationName: string;
  country: string;
  city: string;
  recommendationsByCategory: Record<string, RecommendedPlace[]>;
  allRecommendations: RecommendedPlace[];
};




