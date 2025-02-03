import api from "../utils/api"
export default function Home() {

    async function disconnect(){
        const {status} = await api.req('/auth/disconnect/google', {
            method: 'DELETE'
        })

        if (status === 200) {
            console.log('Disconnected Google account')
        }
    }

    return (
        <div className="bg-gray-100 flex-grow flex justify-center items-center">
        <div className="bg-white p-4 shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Hello, Vite + React + Tailwind CSS!</h1>
            <p className="text-lg">Edit <code>src/pages/Home.tsx</code> and save to test HMR updates.</p>
            <a href="api/auth/google" className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center">Link account with google</a>
            
            <button className="w-full bg-indigo-600 text-white p-2 rounded-md mt-4" onClick={disconnect}>Disconnect Google</button>

        </div>
        </div>
    )
}