import { useEffect, useRef } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await login(email.current!.value, password.current!.value);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="flex-grow flex justify-center items-center">
      <div className="p-4 shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              ref={email}
              name="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
            <label
              htmlFor="password"
              className="block text-sm font-medium mt-4"
            >
              Password
            </label>
            <input
              ref={password}
              type="password"
              name="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
