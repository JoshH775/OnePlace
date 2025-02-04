import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import api from '../utils/api'
import houseIcon from '../assets/house-icon.svg'

export default function Layout() {

    const { logoutContext } = useAuth();

    const logout = async () => {
        await api.req('/auth/logout', {
            method: 'get'
        })
        logoutContext();

    }
    return (
        <div className="flex flex-grow w-screen">
            <section className="flex flex-col w-72 border border-r-gray-400 p-2 h-full items-center">
            <p className="text-2xl flex items-center gap-2"><img src={houseIcon} alt="house" />OnePlace</p>
            </section>
            <Outlet />
        </div>
    )
}