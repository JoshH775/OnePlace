import { useRef } from "react";

export default function Login() {

    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted');
        console.log(email.current?.value);
        console.log(password.current?.value);

        await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.current?.value,
                password: password.current?.value
            })
        })
    }


    return (
        <div className="bg-gray-100 flex-grow flex justify-center items-center">
        <div className="bg-white p-4 shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input ref={email} name="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">Password</label>
                <input ref={password} type="password" name="password" id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-md">Login</button>
            </form>
        </div>
        </div>
    )
}