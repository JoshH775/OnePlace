
export default function Home() {
    return (
        <div className="bg-gray-100 flex-grow flex justify-center items-center">
        <div className="bg-white p-4 shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Hello, Vite + React + Tailwind CSS!</h1>
            <p className="text-lg">Edit <code>src/pages/Home.tsx</code> and save to test HMR updates.</p>
            <a href="api/auth/google" className="w-full bg-red-600 text-white p-2 rounded-md mt-4 block text-center">Link account with google</a>

        </div>
        </div>
    )
}