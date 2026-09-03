import type {
  Activity,
  CategorySummary,
  CreateActivityRequest,
  CreateExpenseRequest,
  CreateItineraryDayRequest,
  CreateTripRequest,
  Destination,
  Expense,
  ItineraryDay,
  JoinRequestResponse,
  MembershipRole,
  PlaceInfo,
  RemainingBudget,
  Trip,
  TripMemberResponse,
  TripSearchResponse,
  UpdateActivityRequest,
  UpdateExpenseRequest,
  UpdateItineraryDayRequest,
  UpdateTripRequest,
  WeatherInfo,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export type ApiError = Error & { status?: number };

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : typeof payload === "string" && payload
          ? payload
          : `Request failed with status ${response.status}`;

    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

/* --- Trip Helper APIs --- */

export async function getTrips(): Promise<Trip[]> {
  return apiFetch<Trip[]>("/trips");
}

export async function getTrip(id: number | string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}`);
}

export async function createTrip(data: CreateTripRequest): Promise<Trip> {
  return apiFetch<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrip(id: number | string, data: UpdateTripRequest): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(id: number | string): Promise<void> {
  return apiFetch<void>(`/trips/${id}`, {
    method: "DELETE",
  });
}

/* --- Destination Helper APIs --- */

export async function getDestinations(): Promise<Destination[]> {
  return apiFetch<Destination[]>("/destinations");
}

export async function getDestination(id: number | string): Promise<Destination> {
  return apiFetch<Destination>(`/destinations/${id}`);
}

export async function getDestinationWeather(id: number | string): Promise<WeatherInfo> {
  return apiFetch<WeatherInfo>(`/destinations/${id}/weather`);
}

export async function getDestinationPlaces(id: number | string): Promise<PlaceInfo[]> {
  return apiFetch<PlaceInfo[]>(`/destinations/${id}/places`);
}

/* --- Itinerary Day Helper APIs --- */

export async function getItineraries(tripId: number | string): Promise<ItineraryDay[]> {
  return apiFetch<ItineraryDay[]>(`/trips/${tripId}/itineraries`);
}

export async function getItinerary(dayId: number | string): Promise<ItineraryDay> {
  return apiFetch<ItineraryDay>(`/itineraries/${dayId}`);
}

export async function createItinerary(
  tripId: number | string,
  data: CreateItineraryDayRequest
): Promise<ItineraryDay> {
  return apiFetch<ItineraryDay>(`/trips/${tripId}/itineraries`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateItinerary(
  dayId: number | string,
  data: UpdateItineraryDayRequest
): Promise<ItineraryDay> {
  return apiFetch<ItineraryDay>(`/itineraries/${dayId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteItinerary(dayId: number | string): Promise<void> {
  return apiFetch<void>(`/itineraries/${dayId}`, {
    method: "DELETE",
  });
}

/* --- Activity Helper APIs --- */

export async function getActivities(dayId: number | string): Promise<Activity[]> {
  return apiFetch<Activity[]>(`/itineraries/${dayId}/activities`);
}

export async function createActivity(
  dayId: number | string,
  data: CreateActivityRequest
): Promise<Activity> {
  return apiFetch<Activity>(`/itineraries/${dayId}/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(
  dayId: number | string,
  activityId: number | string,
  data: UpdateActivityRequest
): Promise<Activity> {
  return apiFetch<Activity>(`/itineraries/${dayId}/activities/${activityId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteActivity(
  dayId: number | string,
  activityId: number | string
): Promise<void> {
  return apiFetch<void>(`/itineraries/${dayId}/activities/${activityId}`, {
    method: "DELETE",
  });
}

/* --- Expense Helper APIs --- */

export async function createExpense(
  tripId: number | string,
  data: CreateExpenseRequest
): Promise<Expense> {
  return apiFetch<Expense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getExpenses(tripId: number | string): Promise<Expense[]> {
  return apiFetch<Expense[]>(`/trips/${tripId}/expenses`);
}

export async function updateExpense(
  tripId: number | string,
  expenseId: number | string,
  data: UpdateExpenseRequest
): Promise<Expense> {
  return apiFetch<Expense>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(
  tripId: number | string,
  expenseId: number | string
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });
}

export async function getExpenseCategorySummary(
  tripId: number | string
): Promise<CategorySummary[]> {
  return apiFetch<CategorySummary[]>(`/trips/${tripId}/expenses/summary`);
}

export async function getRemainingBudget(
  tripId: number | string
): Promise<RemainingBudget> {
  return apiFetch<RemainingBudget>(`/trips/${tripId}/expenses/remaining-budget`);
}

/* --- Membership Helper APIs --- */

export async function getTripMembers(
  tripId: number | string
): Promise<TripMemberResponse[]> {
  return apiFetch<TripMemberResponse[]>(`/trips/${tripId}/members`);
}

export async function addTripMember(
  tripId: number | string,
  email: string
): Promise<TripMemberResponse> {
  return apiFetch<TripMemberResponse>(`/trips/${tripId}/members`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function changeTripMemberRole(
  tripId: number | string,
  userId: number | string,
  role: MembershipRole
): Promise<TripMemberResponse> {
  return apiFetch<TripMemberResponse>(`/trips/${tripId}/members/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function removeTripMember(
  tripId: number | string,
  userId: number | string
): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/members/${userId}`, {
    method: "DELETE",
  });
}

/* --- Join Request Helper APIs --- */

export async function searchTrips(name: string): Promise<TripSearchResponse[]> {
  return apiFetch<TripSearchResponse[]>(`/trips/search?name=${encodeURIComponent(name)}`);
}

export async function createJoinRequest(
  tripId: number | string
): Promise<JoinRequestResponse> {
  return apiFetch<JoinRequestResponse>(`/trips/${tripId}/join-requests`, {
    method: "POST",
  });
}

export async function getPendingJoinRequests(
  tripId: number | string
): Promise<JoinRequestResponse[]> {
  return apiFetch<JoinRequestResponse[]>(`/trips/${tripId}/join-requests`);
}

export async function approveJoinRequest(
  tripId: number | string,
  requestId: number | string
): Promise<JoinRequestResponse> {
  return apiFetch<JoinRequestResponse>(`/trips/${tripId}/join-requests/${requestId}/approve`, {
    method: "PATCH",
  });
}

export async function rejectJoinRequest(
  tripId: number | string,
  requestId: number | string
): Promise<JoinRequestResponse> {
  return apiFetch<JoinRequestResponse>(`/trips/${tripId}/join-requests/${requestId}/reject`, {
    method: "PATCH",
  });
}





