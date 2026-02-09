import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  [
    "px-3 py-2 rounded-lg text-sm font-medium transition",
    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

export default function Navbar() {
    return (
        <header className= "border-b bg-white">
            <div className= "mx-auto max-w-6xl px-4 py-3 flex justify-between">
                <Link to="/" className="font-semibold">
                    DriverLog <span className="text-gray-500">Employer</span>
                </Link>

                <nav className="flex gap-2">

                    <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                    <NavLink to="/assignments" className={linkClass}>Assignments</NavLink>
                    <NavLink to="/reports" className={linkClass}>Reports</NavLink>
                    <NavLink to="/flagged" className={linkClass}>Flagged</NavLink>
                    <NavLink to="/Login" className={linkClass}>Login</NavLink>

                </nav>

            </div>

        </header>

    );
}