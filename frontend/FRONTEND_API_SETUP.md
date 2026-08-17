# TripNest Frontend - API Driven Setup

## Backend

The frontend expects the Spring Boot backend at:

`http://localhost:8080/api`

You can override this with `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Connected backend endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/test/protected`
- `GET /api/destinations`
- `GET /api/destinations/{id}`
- `POST /api/trips`
- `GET /api/trips/my`
- `GET /api/trips/{id}`
- `PUT /api/trips/{id}`
- `DELETE /api/trips/{id}`

Protected requests automatically send:

`Authorization: Bearer <token>`

## Frontend routes

- `/login`
- `/register`
- `/dashboard`
- `/destinations/{id}`
- `/trips`
- `/trips/new`
- `/trips/{id}`
- `/profile`
- `/settings`

## No fake data

The dashboard, destinations and trips use backend responses. There are no hardcoded sample trips, destinations, weather values, favourites, preference values or fake statistics.

The current backend does **not** expose APIs for:

- live weather on destinations
- travel preferences
- favourite destinations
- notification/privacy settings
- itinerary/activity management

The frontend intentionally does not fabricate those values. Their UI states explain that the backend endpoint is not available yet.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.
