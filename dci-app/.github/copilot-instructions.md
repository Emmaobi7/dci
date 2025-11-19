# Copilot Instructions for dci-app

## Stack & Entry Points
- React 19 + Vite app; `src/main.jsx` renders `App.jsx`, which wraps everything in shared providers.
- `ProtectedApp` decides between `Dashboard` and the auth `Router`; keep new roots inside the provider tree so contexts stay available.

## Providers & Firebase
- `src/firebase.js` initializes Firebase Auth + Firestore; keys are in-source, so avoid duplicating clients or leaking credentials elsewhere.
- `contexts/AuthContext.jsx` exposes `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `loading`, and `error`; never call Firebase Auth directly in components outside this hook.
- `contexts/UserContext.jsx` mirrors `users/{uid}` docs, auto-creates a default profile, and shares helpers like `enrollInCourse`, `updateProgress`, and role predicates.
- `contexts/CourseContext.jsx` streams `courses` plus instructor-scoped `myCourses`, sorts client-side to avoid Firestore indexes, and centralizes course CRUD, module ops, analytics, and enrollment writes.

## UX Flow
- `Router.jsx` is a minimal state machine flipping between `Login`, `Signup`, `ForgotPassword`, and legal pages—no React Router is involved.
- `Dashboard.jsx` owns `currentView` (`dashboard`, `catalog`, `create-course`, `course-management`, `course-learning`) and wires contexts + modals together.
- Enrollment path: `CourseCatalog` → `Dashboard.handleEnrollCourse` → `PaymentModal` → `CourseContext.enrollStudent` + `UserContext.enrollInCourse` → `EnrollmentSuccess`.
- Instructor surface: `CreateCourse` collects metadata/modules/tags, then `CourseManagement` + `ModuleEditor` handle ongoing edits.
- Learner surface: `CourseLearning` synthesizes live sessions, records attendance under `attendance/{courseId_userId}`, and updates `UserContext` progress via `updateUserProgress`.

## Role-Specific Surfaces
- Roles live on `userProfile.role`; leverage `hasRole`/`isAdmin` helpers instead of manual string checks.
- `AdminBootstrap`, `RoleManager`, and `AdminCourseManager` appear only for admins; bootstrap promotes the first auth’d user by calling `updateUserProfile`.
- Instructor-only views check both `role === 'instructor'` and `course.instructorId === user.uid` before exposing management actions.
- Dev aids (`TestRoleSwitcher`, `LocalDataManager`, `TestDataLoader`, `FirebaseDataSeeder`) live in `src/components` for seeding or offline demos—keep them out of production menus.

## Styling & Components
- UI is Tailwind-heavy with a glassmorphism look; reuse atoms in `src/components` (Button/Input/Card/Logo) to preserve typography (`font-mono`) and spacing.
- Icons come from `react-icons/fa`; match existing iconography for new buttons or stats.

## Data & Rules
- Expected Firestore collections: `users`, `courses`, `attendance`; update `firestore.rules` when adding fields to keep parity.
- Course docs mix Firestore Timestamps and ISO strings; convert with `new Date(value)` before sorting, and prefer ISO when adding new fields to stay consistent with `CourseContext`.
- Firestore doc id is the truth; helpers sometimes stash a `uuid` inside the payload, so keep both synchronized when cloning courses.

## Developer Workflow
- Install deps via `npm install`; scripts: `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint`.
- Tailwind v4 runs through `@tailwindcss/vite`; restart the dev server after editing `tailwind.config.js` or the theme helpers in `src/theme`.
- No automated tests yet; smoke-test by running `npm run dev` and exercising auth, course creation, enrollment, and attendance flows.

## Extending Safely
- Always consume auth/user/course data through their hooks; avoid duplicating listeners that can desync Firestore state.
- Use `onSnapshot` for real-time dashboards and wrap new queries with role checks so students cannot fetch other instructors’ data.
- Centralize navigation changes inside `Dashboard.jsx`’s `currentView` pattern to prevent orphaned modals.
- Update `src/data/sampleData.js` plus the seeder utilities whenever you add new required fields, so local/dev environments stay aligned.
