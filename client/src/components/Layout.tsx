import { Outlet, Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import {
  FolderIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  MoonIcon,
  PhotoIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import IconLink from "./ui/IconLink";
import IconButton from "./ui/IconButton";
import SearchBar from "./SearchBar";

interface LinkProps {
  text: string;
  to: string;
  icon: React.ReactNode;
}

export default function Layout() {
  const [pathname, setPathname] = useState(window.location.pathname);

  const Link = ({ text, to, icon }: LinkProps) => {
    const bgClass =
      pathname === to
        ? "dark:bg-onyx-light"
        : "transition duration-125 dark:hover:bg-onyx-light ";
    return (
      <RouterLink
        to={to}
        className={"flex items-center gap-2 p-[6px] rounded-md " + bgClass}
        onClick={() => setPathname(to)}
      >
        <div className="flex gap-2">
          {icon}
          <p>{text}</p>
        </div>
      </RouterLink>
    );
  };

  function toggleDarkMode() {
    const html = document.querySelector("html");
    if (!html) return;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
    window.localStorage.theme = html.classList.contains("dark")
      ? "dark"
      : "light";
  }

  return (
    <>
      <header className="flex py-4 px-4 justify-between shadow-md items-center text-3xl dark:bg-onyx-light z-10">
        <IconLink
          to="/"
          icon={<FolderIcon className="h-[1.875rem]" />}
          text="OnePlace"
          className="w-72 font-semibold justify-start"
        />

        <SearchBar />

        <IconLink
          to="/settings"
          icon={
            <Cog6ToothIcon className="h-[1.875rem] hover:rotate-45 rounded-full transition-transform duration-150 mx-1" />
          }
        />
        <IconButton
          onClick={toggleDarkMode}
          icon={<MoonIcon className="h-[1.875rem] mx-1" />}
        />
      </header>
      <div className="flex flex-grow w-full">
        <section className="w-72 flex-col flex border-r border-gray-300 dark:border-onyx-light p-3 justify-between">
          <div className="gap-2 flex flex-col">
            <Link
              to="/"
              text="Home"
              icon={<HomeIcon className="w-6 h-6" />}
            />
            <Link
              to="/photos"
              text="Photos"
              icon={<PhotoIcon className="w-6 h-6" />}
            />
            <Link
              to="/collections"
              text="Collections"
              icon={<FolderIcon className="w-6 h-6" />}
            />
            <Link
              to="/settings"
              text="Settings"
              icon={<Cog6ToothIcon className="w-6 h-6" />}
            />
          </div>

          <div className="w-full pt-2 border-t border-gray-300 dark:border-onyx-light">
            <button className="cursor-pointer flex w-full gap-2   justify-center items-center bg-red-600 rounded-lg p-2 text-white">
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
