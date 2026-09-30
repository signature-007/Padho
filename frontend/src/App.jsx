import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";
import CourseLearn from "./pages/student/CourseLearn";
import Assignments from "./pages/student/Assignments";
import AssignmentSubmit from "./pages/student/AssignmentSubmit";
import Progress from "./pages/student/Progress";
import Profile from "./pages/student/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCourses from "./pages/admin/ManageCourses";
import CourseForm from "./pages/admin/CourseForm";
import ManageModules from "./pages/admin/ManageModules";
import ManageAssignments from "./pages/admin/ManageAssignments";
import ViewSubmissions from "./pages/admin/ViewSubmissions";
import StudentProgress from "./pages/admin/StudentProgress";

const NotFound = () => (
  <main className="container page">
    <div className="empty">
      <strong>Page not found</strong>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </div>
  </main>
);

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/learn/:courseId" element={<CourseLearn />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/:id" element={<AssignmentSubmit />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/courses/new" element={<CourseForm />} />
          <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
          <Route path="/admin/modules" element={<ManageModules />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
          <Route path="/admin/submissions" element={<ViewSubmissions />} />
          <Route path="/admin/progress" element={<StudentProgress />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="footer">© 2026 Padho, Inc.</footer>
    </>
  );
}
