# TripNest API - Postman Testing Collection

This directory contains the Postman Collection and Environment configuration files for testing all REST API endpoints of the **TripNest Travel Planning & Trip Management Platform**.

---

## 📁 Files Included

| File | Description |
| :--- | :--- |
| `TripNest_API.postman_collection.json` | Postman v2.1.0 Collection containing requests, headers, sample request bodies, auto-token capturing, and assertions. |
| `TripNest_Local.postman_environment.json` | Postman Environment file configured for local development (`http://localhost:8080`). |

---

## 🚀 Quick Start Guide

### 1. Import into Postman
1. Open **Postman**.
2. Click **Import** in the top left.
3. Select and import both:
   - `TripNest_API.postman_collection.json`
   - `TripNest_Local.postman_environment.json`
4. Select `TripNest Local Environment` from the environment selector drop-down in the upper-right corner.

---

## 🔑 Automated JWT Authentication Workflow

1. Run **`1. Authentication -> Register New User`** or **`Login User`**.
2. The collection includes a post-request test script that automatically extracts the returned JWT token and sets the `{{token}}` variable.
3. All authenticated requests in **`Trips`**, **`Security & Role Tests`**, and **`Admin Management`** automatically inherit and pass this Bearer Token.

---

## 📌 Included Request Groups

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and retrieve JWT token

### 2. Destinations (`/api/destinations`)
- `GET /api/destinations` - Get list of destinations (Public)
- `GET /api/destinations/{id}` - Get destination details (Public)

### 3. Trips (`/api/trips`)
- `POST /api/trips` - Create trip (Auto-saves `{{trip_id}}`)
- `GET /api/trips/my` - List current user's trips
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip details
- `DELETE /api/trips/{id}` - Delete trip

### 4. Security & Role Tests (`/api/test`)
- `GET /api/test/protected` - General protected test
- `GET /api/test/traveler-only` - Test `TRAVELER` role access
- `GET /api/test/manager-only` - Test `GROUP_ADMIN` or `ADMINISTRATOR` role access

### 5. Admin Management (`/api/admin`)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List all registered users
- `PUT /api/admin/users/{id}/role` - Update role for a user

---

## 🛠 Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `base_url` | `http://localhost:8080` | Backend API base URL |
| `token` | *(auto-populated)* | JWT Bearer token |
| `trip_id` | `1` *(auto-populated on creation)* | ID of target trip |
| `user_id` | `1` | Target user ID for admin updates |
