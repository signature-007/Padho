import { NavLink } from "react-router-dom";

const student = [
  ["/dashboard", "Dashboard"],
  ["/my-courses", "My courses"],
  ["/assignments", "Assignments"],
  ["/progress", "Progress"],
  ["/profile", "Profile"],
];
const admin = [
  ["/admin", "Dashboard"],
  ["/admin/students", "Students"],
  ["/admin/courses", "Courses"],
  ["/admin/modules", "Modules"],
  ["/admin/assignments", "Assignments"],
  ["/admin/submissions", "Submissions"],
  ["/admin/progress", "Progress"],
];

export default function SubNav({ role }) {
  const links = role === "admin" ? admin : student;
  return (
    <div className="subnav">
      <div className="container subnav-inner">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
