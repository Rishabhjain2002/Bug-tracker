# Bug Tracking System (Mini Jira)

A full-stack app where teams manage **projects, users and tickets**. Users can create, assign, prioritise, search and filter tickets.

**Live demo:** Frontend `<VERCEL_URL>` · API `<RAILWAY_URL>/api`

| Role | Email | Password |
|---|---|---|
| Admin | admin@bugtracker.com | Admin@123 |
| Member | member@bugtracker.com | Member@123 |

## Tech stack
- **Frontend:** React 19 (Vite), React Router, Context API (auth state), Axios, plain responsive CSS
- **Backend:** Node.js, Express 5, PostgreSQL (`pg`), JWT authentication, bcrypt password hashing
- **Hosting:** Vercel (frontend), Railway (API + PostgreSQL)

## Features
- Register / login with JWT; the token is stored in localStorage and sent as `Authorization: Bearer <token>`
- CRUD for **tickets**, **projects** and **users**
- Assign tickets to team members and set priority (**Low / Medium / High**) and status (Open / In Progress / Resolved / Closed)
- Search by title or description, and filter by project, status, priority and assignee
- One reusable `TicketForm` for both creating and editing tickets
- Responsive layout; tables turn into cards on mobile
- **Role-based access control**

| Action | Admin | Member |
|---|---|---|
| View tickets, projects and users | ✅ | ✅ |
| Create a ticket | ✅ | ✅ |
| Edit a ticket | any | if reporter or assignee |
| Delete a ticket | any | if reporter |
| Create / edit / delete projects | ✅ | ❌ |
| Change user roles / delete users | ✅ | ❌ |

## Project structure
```
server/src/
  index.js            Express app, routes, error handling
  db.js / schema.sql  PostgreSQL pool and table definitions
  seed.js             demo data
  middleware/         authenticate (JWT), authorize(role), errorHandler
  controllers/        auth, user, project, ticket logic
  routes/             REST route definitions
client/src/
  api/client.js       Axios instance with token interceptor
  context/            AuthContext (Context API)
  components/         Navbar, ProtectedRoute, TicketForm, TicketFilters, Badge
  pages/              Login, Register, Tickets, TicketFormPage, Projects, Users
```

## REST API
All endpoints except register/login need a JWT. Errors return `{ "message": "..." }` with a matching status code (400, 401, 403, 404, 409, 500).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | public | Create an account (role: member) |
| POST | /api/auth/login | public | Log in, returns token |
| GET | /api/auth/me | auth | Current user |
| GET | /api/users | auth | List users |
| GET | /api/users/:id | auth | Get a user |
| PUT | /api/users/:id | admin | Update name / role |
| DELETE | /api/users/:id | admin | Delete a user |
| GET | /api/projects | auth | List projects |
| GET | /api/projects/:id | auth | Get a project |
| POST | /api/projects | admin | Create a project |
| PUT | /api/projects/:id | admin | Update a project |
| DELETE | /api/projects/:id | admin | Delete a project and its tickets |
| GET | /api/tickets | auth | List tickets. Query: `search`, `status`, `priority`, `project_id`, `assignee_id` |
| GET | /api/tickets/:id | auth | Get a ticket |
| POST | /api/tickets | auth | Create a ticket |
| PUT | /api/tickets/:id | admin / reporter / assignee | Update a ticket |
| DELETE | /api/tickets/:id | admin / reporter | Delete a ticket |

Ticket body: `{ "title", "description", "project_id", "assignee_id", "priority", "status" }`

## Run locally
Requires Node 20+ and PostgreSQL.

```bash
# Backend
cd server
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm install
npm run seed              # creates tables + demo data (resets existing data)
npm run dev               # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Deployment
- **Railway:** add a PostgreSQL database and a service from this repo with root directory `server`. Set the variables `DATABASE_URL` (reference to the Postgres `DATABASE_URL`), `JWT_SECRET` and `CLIENT_URL` (the Vercel URL). Tables are created automatically on startup. To load the demo data, run `npm run seed` once with `DATABASE_URL` set to the database's public URL.
- **Vercel:** import the repo with root directory `client` and set `VITE_API_URL` to `<RAILWAY_URL>/api`.
