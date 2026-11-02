# Bug Tracking System (Mini Jira)

A full-stack app where teams manage **projects, users and tickets**. Users can create, assign, prioritise, search and filter tickets.

**Live demo:** Frontend `<VERCEL_URL>` · API `<RAILWAY_URL>/api`

| Role | Email | Password |
|---|---|---|
| Admin | admin@bugtracker.com | Admin@123 |
| Member | member@bugtracker.com | Member@123 |

## Tech stack
- **Frontend:** React 19 (Vite), React Router, Context API (auth + toasts), Axios, lucide-react icons, plain responsive CSS
- **Backend:** Node.js, Express 5, PostgreSQL (`pg`), JWT authentication, bcrypt password hashing
- **Hosting:** Vercel (frontend), Railway (API + PostgreSQL)

## Features
- Register / login with JWT; the token is stored in localStorage and sent as `Authorization: Bearer <token>`
- CRUD for **tickets**, **projects** and **users**
- **Kanban board** with one column per status (Open / In Progress / Resolved / Closed). Drag a card to another column to change its status; only cards you are allowed to edit can be dragged, and a rejected move is rolled back.
- Tickets open in a modal over the board (details on the left, status / assignee / priority / project on the right). Without edit permission the ticket is shown read-only.
- Assign tickets to team members and set priority (**Low / Medium / High**)
- Search by title or description, filter by project and priority, and click team avatars to filter by assignee
- Toast notifications for every action, confirm dialogs for deletes, loading skeletons and empty states
- One-click demo login buttons for the seeded Admin and Member accounts
- Responsive layout: on tablets the sidebar becomes a top bar, and on phones the board scrolls sideways one column at a time. Drag and drop uses the browser's HTML5 drag-and-drop, which needs a mouse, so on touch screens change the status from the ticket page.
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
  context/            AuthContext (logged-in user), ToastContext (notifications)
  permissions.js      canEditTicket / canDeleteTicket (mirror of the API rules)
  components/         Sidebar, ProtectedRoute, AuthLayout, BoardColumn, TicketCard, TicketModal,
                      TicketForm, TicketFilters, Modal, ConfirmDialog, Avatar, PriorityIcon
  pages/              Login, Register, Board, Projects, Users
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
| GET | /api/projects | auth | List projects (with ticket_count) |
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
