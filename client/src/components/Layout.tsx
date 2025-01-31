import { Outlet, Link } from "react-router-dom";
import { api } from "../utils";
import { useAuth } from "./AuthProvider";

export default function Layout() {

    const { logoutContext } = useAuth();

    const logout = async () => {
        await api('/auth/logout', {
            method: 'get'
        })
        logoutContext();

    }
    return (
        <>
            <header className="flex w-full gap-4 border-b border-black">
                <Link to="/" className="p-4">Home</Link>
                <Link to="/albums" className="p-4">Albums</Link>
                <button className="p-4" onClick={logout}>Logout</button>
            </header>
            <Outlet />
        </>
    )
}