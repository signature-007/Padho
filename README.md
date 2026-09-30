# Learnly LMS — Learning Management System

A full-stack Learning Management System where students enroll in courses, work through modules, submit assignments and track their progress, while instructors manage courses, content, assignments and grading from an admin dashboard.



## Problem statement and objectives
Course content, assignments and student progress are often scattered across chats, drive folders and spreadsheets. This project centralises them in one platform with secure, role-based access.

- Secure registration, login and role-based access (Student / Admin)
- Course, module and assignment management for instructors
- Enrollment, module completion and progress tracking for students
- Assignment submission (text, link or file) with marks and feedback
- Dashboards for both roles

## Key features
**Student:** register / log in, search and filter courses, enroll, *My courses*, open modules with notes and learning materials (PDF, video, reference, code, exercise links), mark modules complete, view assignments and deadlines, submit text / GitHub / Drive / project URL / file, see marks and feedback, progress bars, profile and password change.

**Admin / Instructor:** dashboard statistics, course CRUD, add / edit / order modules with resources, assignment CRUD, view and remove students, review submissions, enter marks / feedback / status, monitor student progress per course.

**Platform:** bcrypt password hashing, JWT auth, protected routes on both frontend and backend, server-side validation, duplicate-enrollment protection, late-submission flag, responsive UI.

## Technology stack
| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Vite, plain CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt (bcryptjs) |
| Uploads | Multer (max 5 MB, allow-listed file types) |


## Installation steps
Prerequisites: **Node.js 18+** and **MongoDB** running locally (or a free MongoDB Atlas cluster).

```bash
# 1. install dependencies for both apps
npm run install-all

# 2. configure the backend
cd backend
cp .env.example .env        # then edit .env (set JWT_SECRET, and MONGO_URI if not local)
cd ..

# 3. load demo data (creates the admin + sample courses)
npm run seed

# 4. run both servers in two terminals
npm run dev:backend         # API on http://localhost:5000
npm run dev:frontend        # App on http://localhost:5173
```

Open http://localhost:5173.

### Demo accounts (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin / Instructor | admin@lms.com | Admin@123 |
| Student | student@lms.com | Student@123 |

> `npm run seed` **erases** all LMS data first. Change these passwords before any real deployment. Public registration only ever creates students; admins are created by the seed script (or directly in the database).

## Environment variables
`backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string (default `mongodb://127.0.0.1:27017/lms`) |
| `JWT_SECRET` | **Required.** Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Allowed frontend origin(s), comma separated. Only needed when the frontend is hosted elsewhere |

`frontend/.env` (optional): `VITE_API_URL` — full API URL (e.g. `https://my-api.onrender.com/api`) when the API is on another origin.

`.env` is git-ignored — never commit credentials.

## Database setup
MongoDB collections are created automatically by Mongoose. `npm run seed` fills them with demo data. See [docs/DATABASE.md](docs/DATABASE.md) for the full schema.

## Deployment
1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Push this repo to GitHub and create a Web Service from it.
3. Build command: `npm run install-all && npm run build` — Start command: `npm start`
4. Set `MONGO_URI` and `JWT_SECRET` (and `NODE_ENV=production`) as environment variables.
5. Run `npm run seed` once against the Atlas database (locally with `MONGO_URI` pointing at Atlas) to create the admin account.

When `frontend/dist` exists, Express serves the React app and the API from the same origin, so no CORS setup is needed.


## Testing checklist (from the project brief)
All items were exercised against a running instance with an automated API test (62 checks) and a browser walkthrough of the student and admin flows.

- [x] Registration and login work for valid users
- [x] Invalid credentials and duplicate registration are handled (401 / 409)
- [x] Student cannot access admin-only pages or endpoints (403, redirected on the frontend)
- [x] Admin can create / edit / delete courses and assignments
- [x] Enrollment does not create duplicate records (unique index + 409)
- [x] Assignment submission is stored correctly (text, link, file)
- [x] Progress updates after module completion (and when modules are added / removed)
- [x] Forms validate required fields and invalid input (client and server)
- [x] Usable at desktop and mobile widths
- [x] Data persists in MongoDB after refresh / restart



## Future improvements
Quiz module, certificate generation, email notifications, password reset, discussion forum, analytics charts, profile photo upload, course ratings, dark mode.