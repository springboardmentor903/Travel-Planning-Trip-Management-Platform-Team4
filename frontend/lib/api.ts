import type {
  Activity,
  AuthResponse,
  CategorySummary,
  CreateActivityRequest,
  CreateExpenseRequest,
  CreateItineraryDayRequest,
  CreateTripRequest,
  Destination,
  Expense,
  ItineraryDay,
  LoginRequest,
  Notification,
  PlaceInfo,
  RegisterRequest,
  RemainingBudget,
  Trip,
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
      // Only clear the session and redirect when the 401 is a genuine token
      // authentication failure. Check that the response body signals an auth
      // problem (missing/invalid token) rather than some other server-side 401
      // (e.g. a misconfigured or missing endpoint that Spring Security rejects
      // before even reaching a controller).
      const isAuthFailure =
        typeof payload === "object" && payload !== null
          ? ("error" in payload &&
              typeof payload.error === "string" &&
              (payload.error.toLowerCase().includes("token") ||
                payload.error.toLowerCase().includes("authentication") ||
                payload.error.toLowerCase().includes("unauthorized") ||
                payload.error.toLowerCase().includes("log in"))) ||
            ("message" in payload &&
              typeof payload.message === "string" &&
              (payload.message.toLowerCase().includes("token") ||
                payload.message.toLowerCase().includes("authentication") ||
                payload.message.toLowerCase().includes("unauthorized") ||
                payload.message.toLowerCase().includes("log in")))
          : typeof payload === "string" &&
            (payload.toLowerCase().includes("token") ||
              payload.toLowerCase().includes("authentication") ||
              payload.toLowerCase().includes("unauthorized") ||
              payload.toLowerCase().includes("log in"));

      // No payload at all (empty body 401) → also treat as auth failure
      const emptyBody = payload === null || payload === "" || payload === undefined;

      if (isAuthFailure || emptyBody) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
      }
    }

    let message = `Request failed with status ${response.status}`;
    if (typeof payload === "object" && payload) {
      if ("message" in payload && payload.message) {
        message = String(payload.message);
      } else if ("error" in payload && payload.error) {
        message = String(payload.error);
      }
    } else if (typeof payload === "string" && payload.trim()) {
      message = payload.trim();
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

/* --- Authentication APIs --- */

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export async function getPopularDestinations(): Promise<Destination[]> {
  return apiFetch<Destination[]>("/destinations/popular");
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

/* --- Notification Helper APIs --- */

export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>("/notifications");
}
