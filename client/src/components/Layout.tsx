import {
  Navigate,
  Outlet,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import {
  FolderIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  PhotoIcon,
  HomeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";
import Spinner from "./ui/Spinner";

interface LinkProps {
  text: string;
  to: string;
  icon: React.ReactNode;
}

const Link = ({ text, to, icon }: LinkProps) => {
  const { pathname } = useLocation();
  const bgClass =
    pathname === to
      ? "dark:bg-onyx-light"
      : "transition duration-125 dark:hover:bg-onyx-light ";
  return (
    <RouterLink
      to={to}
      className={"flex items-center gap-2 p-[6px] rounded-md " + bgClass}
    >
      <div className="flex gap-2">
        {icon}
        <p>{text}</p>
      </div>
    </RouterLink>
  );
};

export default function Layout() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }
  
  if (!user && !isLoading) {
    return <Navigate to="/login" />;
  }


  // function toggleDarkMode() {
  //   const html = document.querySelector("html");
  //   if (!html) return;

  //   if (html.classList.contains("dark")) {
  //     html.classList.remove("dark");
  //   } else {
  //     html.classList.add("dark");
  //   }
  //   window.localStorage.theme = html.classList.contains("dark")
  //     ? "dark"
  //     : "light";
  // }

  return (
    <>
      <div className="flex flex-grow w-full">
        <section className="w-60 flex-col flex border-r border-gray-300 dark:border-onyx-light p-3 justify-between">
          <div className="gap-2 flex flex-col">
            <RouterLink
              to="/"
              className="text-3xl text-center font-semibold flex gap-2 items-center my-2"
            >
              <ShieldCheckIcon className="w-10" />
              OnePlace
            </RouterLink>

            <Link to="/" text="Home" icon={<HomeIcon className="w-6" />} />
            <Link
              to="/photos"
              text="Photos"
              icon={<PhotoIcon className="w-6" />}
            />
            <Link
              to="/collections"
              text="Collections"
              icon={<FolderIcon className="w-6" />}
            />
            <Link
              to="/settings"
              text="Settings"
              icon={<Cog6ToothIcon className="w-6" />}
            />
          </div>

          <div className="w-full pt-2 border-t border-gray-300 dark:border-onyx-light">
            <button
              className="cursor-pointer flex w-full gap-2   justify-center items-center bg-red-600 rounded-lg p-2 text-white"
              onClick={logout}
            >
              <ArrowRightStartOnRectangleIcon className="h-5" />
              <p>Logout</p>
            </button>
          </div>
        </section>
        <Outlet />
      </div>
    </>
  );
}
