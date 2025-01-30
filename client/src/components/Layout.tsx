import { Outlet, Link } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <header className="flex w-full gap-4 border-b border-black">
                <Link to="/" className="p-4">Home</Link>
                <Link to="/login" className="p-4">Login</Link>
            </header>
            <Outlet />
        </>
    )
}