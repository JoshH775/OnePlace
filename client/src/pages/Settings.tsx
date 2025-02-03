import { useAuth } from "../components/AuthProvider";
import api from "../utils/api";

export default function Settings(){
    const user = useAuth().user

    return (<div className="bg-gray-100 flex-grow flex justify-center items-center">
        <div className="bg-white p-4 shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-lg">Edit <code>src/pages/Settings.tsx</code> and save to test HMR updates.</p>
            <p className="text-lg">User: {user?.email}</p>
        </div>

        {user?.integrations['google'] ? <button className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center" onClick={()=>{api.disconnectIntegration('google')}}>Disconnect Google</button> : <a href="api/auth/google" className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center">Link account with google</a>}
    </div>)
}