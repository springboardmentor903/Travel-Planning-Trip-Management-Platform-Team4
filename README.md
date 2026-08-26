✈️ Travel Management System

A full-stack Travel Management System designed to help users plan, manage, and track their trips from a single platform.

The application provides functionality for trip management, destinations, itineraries, activities, budgets, expenses, weather information, travel history, user profiles, and travel preferences.

The system follows a layered backend architecture using Entity → Repository → Service → Controller, with a frontend that communicates with the backend through REST APIs.

---

📌 Project Overview

Planning a trip often requires using multiple applications for different tasks such as:

- Creating and managing trips
- Planning itineraries
- Managing activities
- Checking weather conditions
- Tracking travel expenses
- Setting and monitoring budgets
- Managing favourite destinations
- Maintaining travel history
- Managing personal and travel preferences

This project combines these functionalities into a single application.

🎯 Main Objective

To build a centralized travel platform where users can:

«Plan → Organize → Track → Manage → Review their trips»

while keeping travel information, itineraries, activities, weather, budgets, and expenses connected to the user's account.

---

🚀 Key Features

1. 👤 User Authentication

The system provides user authentication functionality including:

- User registration
- User login
- User profile management
- User-specific data access
- Ownership validation

Each user's trips and associated information are protected so that users can access only their own data.

---

2. 🧳 Trip Management

Users can create and manage their trips.

Trip functionality

- Create a trip
- View trips
- Update trip details
- Delete trips
- View individual trip details
- Associate destinations with trips
- Track trip dates

Each trip acts as the central entity connecting other modules.

Trip relationship

User
  │
  └── Trips
        │
        ├── Destination
        ├── Itinerary
        ├── Activities
        ├── Budget
        ├── Expenses
        └── Weather Information

---

3. 🌍 Destination Management

The destination module manages the locations associated with trips.

Users can:

- Select destinations
- Associate destinations with trips
- View destination information
- View popular destinations
- Maintain favourite destinations

---

4. 🗓️ Itinerary Management

The itinerary module allows users to organize their trip schedule.

Users can manage:

- Trip dates
- Planned activities
- Daily schedules
- Locations
- Activity timing

The itinerary is associated with a specific trip.

---

5. 🎯 Activity Management

Activities allow users to plan things they want to do during a trip.

Examples:

- Sightseeing
- Restaurants
- Adventure activities
- Shopping
- Entertainment
- Other planned activities

Activities are connected to the corresponding trip/itinerary.

---

6. 💰 Budget Management

The Budget module allows users to define a financial limit for a trip.

Budget Features

- Create a budget
- Retrieve a trip budget
- Update an existing budget
- Calculate remaining budget
- Connect budget with a specific trip

Budget Calculation

Remaining Budget
       =
Total Budget - Total Expenses

Example

Trip Budget      = ₹50,000
Total Expenses   = ₹32,500

Remaining Budget = ₹17,500

Currency-related values are handled using BigDecimal / exact-decimal representation to avoid floating-point precision problems in monetary calculations.

---

7. 💳 Expense Tracking

The Expense module allows users to record and manage their trip expenses.

Each expense contains information such as:

- Expense category
- Amount
- Date
- Receipt link
- Payer
- Trip
- Budget

Supported Categories

The frontend uses a fixed category list:

Transportation
Hotel
Food
Shopping
Entertainment
Miscellaneous

Expense Relationship

User
  │
  └── Payer
       │
       ▼
     Expense
       │
       ├── Trip
       │
       └── Budget

---

8. 📊 Expense Category Summary

The backend provides an API that groups expenses by category for a particular trip.

Example:

Transportation → ₹8,000
Hotel         → ₹15,000
Food          → ₹5,500
Shopping      → ₹3,000
Entertainment → ₹1,000
Miscellaneous → ₹500

This data is consumed by the frontend to generate a dynamic chart.

The chart does not use hardcoded values.

---

9. 📈 Expense Chart

The Trip Details page contains a Chart.js visualization.

The chart displays spending distribution by category.

Example:

              Trip Expenses
                   │
       ┌───────────┼───────────┐
       │           │           │
   Hotel         Food    Transportation
       │           │           │
      ₹15K       ₹5.5K         ₹8K

The frontend fetches the category-summary data directly from the backend.

---

10. 🌦️ Live Weather Integration

The application integrates an external weather API.

The backend weather service:

Frontend
   │
   ▼
Backend Weather Controller
   │
   ▼
Weather Service
   │
   ▼
External Weather API
   │
   ▼
Weather Response
   │
   ▼
Frontend

The weather information can be used to provide relevant conditions for the user's destination.

---

11. 📊 User Dashboard

The Dashboard provides an overview of the user's travel information.

It can display:

Upcoming Trips

Trips that are scheduled for the future.

Recent Trips

Previously created or recently completed trips.

Favourite Destinations

Destinations saved by the user.

Popular Destinations

Destinations retrieved from the backend popular-destination API.

Weather

Relevant weather information for the user's destinations.

Quick Actions

Users can quickly:

- Create a trip
- Manage trips
- View travel history
- Manage preferences
- Access profile
- Manage favourite destinations

---

12. 👤 Profile Page

The Profile page allows users to view their personal information.

Depending on the available backend functionality, users can manage:

- Name
- Email
- Profile information
- Other user details

The frontend communicates with backend APIs for retrieving and updating profile information.

---

13. ❤️ Travel Preferences & Favourite Destinations

Users can manage their travel preferences.

The section may include:

- Preferred destinations
- Preferred travel type
- Favourite destinations
- Other travel preferences

Example:

Preferred Travel Type → Adventure
Preferred Destinations → Goa, Kerala, Hyderabad
Favourite Destinations → Goa, Manali

The frontend retrieves and updates this information through backend APIs where available.

---

14. 📚 Travel History

The Travel History section displays the user's previous trips.

Information includes:

- Trip name
- Destination
- Start date
- End date
- Other relevant trip information

The data is retrieved from the user's stored trips.

Example:

Trip Name       Destination     Start Date    End Date
--------------------------------------------------------
Goa Trip        Goa             10-06-2026    15-06-2026
Kerala Trip     Kerala          20-07-2026    25-07-2026

---

15. ⚙️ Account Settings

The Account Settings page provides options for managing account-related information.

Depending on backend support, this may include:

- Updating profile information
- Changing password
- Managing travel preferences
- Managing account information

---

🏗️ System Architecture

The application follows a layered full-stack architecture.

                    ┌─────────────────────┐
                    │      Frontend       │
                    │                     │
                    │ Trip Details        │
                    │ Dashboard           │
                    │ Profile             │
                    │ Expenses            │
                    │ Budget              │
                    │ Travel History      │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Controller      │
                    │                     │
                    │ REST Endpoints      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Service       │
                    │                     │
                    │ Business Logic      │
                    │ Validation          │
                    │ Ownership Checks    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Repository      │
                    │                     │
                    │ Database Queries    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Database       │
                    │                     │
                    │ Users               │
                    │ Trips               │
                    │ Destinations        │
                    │ Budgets             │
                    │ Expenses            │
                    │ Itineraries         │
                    │ Activities          │
                    └─────────────────────┘

---

🧱 Backend Architecture

The backend follows:

Controller
    ↓
Service
    ↓
Repository
    ↓
Database

Controller Layer

Responsible for:

- Receiving HTTP requests
- Request validation
- Returning HTTP responses
- Calling service methods

Service Layer

Responsible for:

- Business logic
- Ownership validation
- Entity relationships
- Budget calculations
- Expense validation
- Payer validation
- Business rules

Repository Layer

Responsible for:

- Database communication
- CRUD operations
- Custom queries

Entity Layer

Represents database entities and their relationships.

---

💾 Database Design

Major entities include:

User
 │
 ├── Trip
 │    │
 │    ├── Destination
 │    ├── Itinerary
 │    │      └── Activity
 │    ├── Budget
 │    │      └── Expense
 │    └── Weather
 │
 ├── Favourite Destinations
 │
 └── Travel Preferences

Important relationships

User 1 ──────── * Trip

Trip 1 ──────── 1 Budget

Trip 1 ──────── * Expense

Budget 1 ────── * Expense

User 1 ──────── * Expense

Trip 1 ──────── * Itinerary

Itinerary 1 ─── * Activity

---

💳 Expense Backend Design

Expense Entity

The Expense entity contains:

Expense
├── id
├── trip
├── budget
├── payer
├── category
├── amount
├── date
└── receiptLink

The "amount" field uses an exact-decimal monetary representation.

---

📁 Expense Repository

The repository provides a query to group expenses by category for a particular trip.

Conceptually:

SELECT category, SUM(amount)
FROM expenses
WHERE trip_id = ?
GROUP BY category;

This allows the application to calculate category-wise spending.

---

⚙️ Expense Service

The Expense Service implements:

Create Expense
List Expenses
Update Expense
Delete Expense
Category Summary
Remaining Budget

Validations

The service validates:

- Amount must not be negative
- Category must be provided
- Payer must belong to the trip
- User must own/access the trip
- Expense must belong to the correct trip/budget

---

🌐 Expense Controller

The Expense Controller exposes REST APIs for:

POST    /expenses
GET     /expenses
PUT     /expenses/{id}
DELETE  /expenses/{id}

GET     /expenses/category-summary/{tripId}

GET     /expenses/remaining-budget/{tripId}

«Actual endpoint paths may vary depending on the implementation.»

---

💰 Budget Backend Design

Budget Entity

The Budget entity is mapped to the database and contains the monetary information associated with a trip.

Conceptually:

Budget
├── id
├── trip
├── amount
└── currency

Currency values are represented using "BigDecimal"/exact-decimal types.

---

📁 Budget Repository

The Budget Repository provides functionality to retrieve the budget associated with a specific Trip ID.

Conceptually:

findByTripId(tripId)

---

⚙️ Budget Service

The Budget Service implements:

Create Budget
Update Budget
Retrieve Trip Budget

It also performs:

- Validation
- Ownership checks
- Trip validation
- Business rules

---

🌐 Budget Controller

REST endpoints include:

POST   /budgets
PUT    /budgets/{id}
GET    /budgets/trip/{tripId}

«Actual endpoint paths may vary depending on the implementation.»

---

🔐 Ownership Validation

Ownership validation is an important part of the application.

Before modifying or accessing protected resources, the backend verifies that the authenticated user has permission to access the corresponding trip/resource.

Example:

Request
   │
   ▼
Is user authenticated?
   │
   ▼
Does trip belong to user?
   │
   ├── No → Reject request
   │
   └── Yes
        │
        ▼
   Perform operation

This prevents users from modifying another user's trip data.

---

🔄 Expense + Budget Flow

The complete expense flow is:

User
 │
 ▼
Trip Details Page
 │
 ▼
Add Expense
 │
 ▼
Frontend sends REST request
 │
 ▼
Expense Controller
 │
 ▼
Expense Service
 │
 ├── Validate amount
 ├── Validate category
 ├── Validate trip
 ├── Validate payer
 └── Validate ownership
 │
 ▼
Expense Repository
 │
 ▼
Database
 │
 ▼
Expense Created
 │
 ▼
Frontend refreshes
 │
 ├── Expense List
 ├── Category Chart
 └── Remaining Budget

---

💰 Remaining Budget Flow

Budget Amount
      │
      ▼
Calculate Total Expenses
      │
      ▼
Budget - Expenses
      │
      ▼
Remaining Budget
      │
      ▼
Trip Details UI

Example:

Budget = ₹100,000

Expenses:
Hotel           ₹25,000
Transportation  ₹15,000
Food            ₹10,000
Shopping         ₹5,000
                --------
Total            ₹55,000

Remaining = ₹45,000

---

🖥️ Frontend — Trip Details Page

The Trip Details page combines the major trip-related functionality.

Budget Section

Displays:

Budget Amount
Currency
Remaining Budget

Expense Section

Displays:

Category
Amount
Date
Payer
Receipt

Add Expense

Users can add expenses using a form.

Category dropdown:

Transportation
Hotel
Food
Shopping
Entertainment
Miscellaneous

Category Chart

Chart.js displays the category-wise spending retrieved from:

GET Category Summary API

No hardcoded chart values are used.

---

🔌 External API Integration

The project integrates an external weather service.

Application
     │
     ▼
Backend
     │
     ▼
Weather Service
     │
     ▼
External Weather API
     │
     ▼
Weather Data
     │
     ▼
Frontend

This approach keeps external API communication inside the backend rather than exposing API credentials directly in the frontend.

---

🧪 API Testing

Backend APIs can be tested using:

- Postman
- Browser/API clients
- Frontend integration

Testing should cover:

Authentication

Register
Login
Unauthorized requests

Trips

Create
Read
Update
Delete

Itinerary

Create
Read
Update
Delete

Activities

Create
Read
Update
Delete

Budget

Create
Get
Update

Expenses

Create
List
Update
Delete
Category Summary
Remaining Budget

Validation

Negative amount
Missing category
Invalid trip
Invalid payer
Unauthorized user
Invalid resource ID

---

🛠️ Technology Stack

Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- REST APIs
- Hibernate / JPA
- BigDecimal for monetary values

Frontend

- React / applicable frontend framework
- HTML
- CSS
- JavaScript
- Chart.js
- REST API integration

Database

- Relational Database
- SQL
- JPA/Hibernate ORM

API Testing

- Postman

External Services

- Weather API

---

📂 Suggested Project Structure

travel-management-system/
│
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           │   └── .../
│           │       ├── controller/
│           │       ├── service/
│           │       ├── repository/
│           │       ├── entity/
│           │       ├── dto/
│           │       ├── exception/
│           │       └── config/
│           │
│           └── resources/
│               └── application.properties
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   │
│   └── package.json
│
└── README.md

---

🔄 Development Flow

The recommended development sequence is:

1. Database Entities
        ↓
2. Entity Relationships
        ↓
3. Repositories
        ↓
4. Services
        ↓
5. Controllers
        ↓
6. Trip APIs
        ↓
7. Destination APIs
        ↓
8. Authentication
        ↓
9. Itinerary APIs
        ↓
10. Activity APIs
        ↓
11. Budget APIs
        ↓
12. Expense APIs
        ↓
13. Weather API
        ↓
14. Popular Destinations API
        ↓
15. Dashboard
        ↓
16. Profile
        ↓
17. Travel Preferences
        ↓
18. Favourite Destinations
        ↓
19. Travel History
        ↓
20. Account Settings
        ↓
21. Frontend Integration
        ↓
22. Postman Testing
        ↓
23. Full Integration Testing

---

🔗 Frontend–Backend Integration

The frontend communicates with the backend using REST APIs.

Example:

React Frontend
      │
      │ HTTP Request
      ▼
Spring Boot REST API
      │
      ▼
Service Layer
      │
      ▼
Repository
      │
      ▼
Database
      │
      ▼
Response
      │
      ▼
React UI

---

🔒 Validation & Error Handling

The application should handle invalid requests properly.

Examples:

Negative Expense
        ↓
400 Bad Request

Missing Category
        ↓
400 Bad Request

Unauthorized Resource
        ↓
401 / 403

Trip Not Found
        ↓
404 Not Found

Expense Not Found
        ↓
404 Not Found

Centralized exception handling can be used to provide consistent API error responses.

---

🎯 Project Goals

The project demonstrates practical implementation of:

- Full-stack application development
- REST API development
- Spring Boot architecture
- JPA/Hibernate
- Relational database design
- Entity relationships
- Authentication and authorization
- Ownership validation
- Financial calculations
- External API integration
- Frontend-backend integration
- Data visualization
- CRUD operations
- API testing

---

📌 Future Enhancements

Potential future improvements include:

- AI-powered itinerary generation
- AI travel recommendations
- Expense prediction
- Budget alerts
- Automatic receipt processing using OCR
- Currency conversion
- Multi-user/group trip management
- Trip sharing
- Map integration
- Hotel and flight API integration
- Personalized destination recommendations
- Weather-based activity recommendations
- Email/SMS notifications

---

🚀 Future AI Integration

The existing system can also serve as a foundation for an AI-powered travel assistant.

For example:

User
 │
 ▼
AI Travel Assistant
 │
 ├── Understand trip requirements
 ├── Analyze budget
 ├── Check weather
 ├── Recommend destinations
 ├── Suggest activities
 └── Generate itinerary
 │
 ▼
Existing Travel APIs
 │
 ├── Trip API
 ├── Budget API
 ├── Expense API
 ├── Weather API
 └── Destination API

This allows AI capabilities to be added without replacing the existing backend architecture.

---

🧑‍💻 Development Status

Module| Status
User Authentication| 🚧 In Development
Trip Management| 🚧 In Development
Destination Management| 🚧 In Development
Itinerary Management| 🚧 In Development
Activity Management| 🚧 In Development
Budget Management| 🚧 In Development
Expense Tracking| 🚧 In Development
Category Summary| 🚧 In Development
Remaining Budget| 🚧 In Development
Weather Integration| 🚧 In Development
Popular Destinations| 🚧 In Development
Dashboard| 🚧 In Development
Profile| 🚧 In Development
Travel Preferences| 🚧 In Development
Favourite Destinations| 🚧 In Development
Travel History| 🚧 In Development
Account Settings| 🚧 In Development

Update these statuses to "✅ Completed" as you finish each module.

---

⚙️ Installation & Setup

1. Clone the Repository

git clone <your-github-repository-url>
cd travel-management-system

2. Backend Setup

Navigate to the backend:

cd backend

Configure you
