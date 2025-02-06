import { useAuth } from "../components/AuthProvider";
import api from "../utils/api";

export default function Settings(){

    const { logoutContext, user } = useAuth();

    const logout = async () => {
      await api.req("/auth/logout", {
        method: "get",
      });
      logoutContext();
    };

    return (<div className="flex-grow flex justify-center items-center w-full">

        {user?.integrations['google'] ? <button className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center" onClick={()=>{api.disconnectIntegration('google')}}>Disconnect Google</button> : <a href="api/auth/google" className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center">Link account with google</a>}

        <button className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center" onClick={logout}>Logout</button>
    </div>)
}