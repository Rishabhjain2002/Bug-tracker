# Bug Tracking System (Mini Jira)

A full-stack app where teams manage **projects, users and tickets**. Users can create, assign, prioritise, search and filter tickets.

**Live demo:** Frontend `<VERCEL_URL>` · API `<RAILWAY_URL>/api`

| Role | Email | Password |
|---|---|---|
| Admin | admin@bugtracker.com | Admin@123 |
| Member | member@bugtracker.com | Member@123 |

The seed also adds five more team members (Priya, Arjun, Sara, David, Neha — e.g. `priya@bugtracker.com`) with the password `Welcome@123`, three projects, seven labels and 18 sample tickets.

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
- **Team page**: admins add team members (name, email, password, job title, role) and give each one a colour, used for their avatar everywhere
- **Labels** (e.g. Bug, Feature, UI) with their own colours; tickets can have several, shown as coloured chips on the cards
- Search by title or description, filter by project, priority and label, and click team avatars to filter by assignee
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
| Create / edit / delete projects and labels | ✅ | ❌ |
| Add team members, change roles / colours, delete users | ✅ | ❌ |

## Project structure
```
server/
  src/app.js          Express app: middleware, routes, error handling (exported for tests)
  src/index.js        creates the tables, then starts the server
  src/db.js           PostgreSQL pool, initDb, inTransaction helper
  src/schema.sql      table definitions
  src/seed.js         demo data
  src/middleware/     authenticate (JWT), authorize(role), errorHandler
  src/controllers/    auth, user, project, label, ticket logic
  src/routes/         REST route definitions
  src/utils/          validate (shared request validators), httpError
  test/api.test.js    API tests (node:test + supertest)
client/src/
  api/client.js       Axios instance with token interceptor
  context/            AuthContext (logged-in user), ToastContext (notifications)
  hooks/              useFetch (load + error toast), useForm (form values), useSubmit (submitting + error)
  permissions.js      canEditTicket / canDeleteTicket (mirror of the API rules)
  components/         reusable UI: Modal, FormModal, ConfirmDialog, PageHeader, EmptyState, Avatar,
                      ColorPicker, LabelChip, PriorityIcon; board: BoardColumn, TicketCard, TicketModal,
                      TicketForm, TicketFilters; forms: ProjectModal, MemberModal, LabelModal
  pages/              Login, Register, Board, Projects, Team, Labels
```

## REST API
All endpoints except register/login need a JWT. Errors return `{ "message": "..." }` with a matching status code (400, 401, 403, 404, 409, 500).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | public | Create an account (role: member) |
| POST | /api/auth/login | public | Log in, returns token |
| GET | /api/auth/me | auth | Current user |
| GET | /api/health | public | Health check, returns `{ "status": "ok" }` |
| GET | /api/users | auth | List users (with open_tickets) |
| GET | /api/users/:id | auth | Get a user |
| POST | /api/users | admin | Add a team member |
| PATCH | /api/users/:id | admin | Partial update of name / role / color / job_title |
| DELETE | /api/users/:id | admin | Delete a user |
| GET | /api/projects | auth | List projects (with ticket_count) |
| GET | /api/projects/:id | auth | Get a project |
| POST | /api/projects | admin | Create a project |
| PUT | /api/projects/:id | admin | Update a project |
| DELETE | /api/projects/:id | admin | Delete a project and its tickets |
| GET | /api/labels | auth | List labels (with ticket_count) |
| POST | /api/labels | admin | Create a label `{ "name", "color" }` |
| PUT | /api/labels/:id | admin | Update a label |
| DELETE | /api/labels/:id | admin | Delete a label (tickets keep existing) |
| GET | /api/tickets | auth | List tickets. Query: `search`, `status`, `priority`, `project_id`, `assignee_id`, `label_id` |
| GET | /api/tickets/:id | auth | Get a ticket |
| POST | /api/tickets | auth | Create a ticket |
| PUT | /api/tickets/:id | admin / reporter / assignee | Update a ticket |
| DELETE | /api/tickets/:id | admin / reporter | Delete a ticket |

Ticket body: `{ "title", "description", "project_id", "assignee_id", "priority", "status", "label_ids" }`. Leave out `label_ids` to keep the current labels. Colours are hex values like `#0c66e4`.

`PUT` replaces the whole resource (tickets and projects send every field), while `PATCH` changes only the fields sent (users: e.g. just the role). Request bodies are validated in `utils/validate.js`, so missing fields, values that are too long, invalid emails and bad colours return 400 with a readable message. A ticket and its labels are saved in one transaction.

## Run locally
Requires Node 20+ and PostgreSQL.

```bash
# Backend
cd server
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm install
npm run seed              # creates tables + demo data (resets existing data)
# or: npm run seed -- --keep   adds only the missing demo data and keeps yours
npm run dev               # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Tests and linting
```bash
cd server && npm test     # 17 API tests; they create and reset a separate <db>_test database
cd client && npm run lint # ESLint with the React hooks rules
```

## Deployment
- **Railway:** add a PostgreSQL database and a service from this repo with root directory `server`. Set the variables `DATABASE_URL` (reference to the Postgres `DATABASE_URL`), `JWT_SECRET` and `CLIENT_URL` (the Vercel URL). Tables are created automatically on startup. To load the demo data, run `npm run seed` once with `DATABASE_URL` set to the database's public URL.
- **Vercel:** import the repo with root directory `client` and set `VITE_API_URL` to `<RAILWAY_URL>/api`.
