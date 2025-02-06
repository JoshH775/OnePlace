import { Outlet, Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { FolderIcon, Cog6ToothIcon, ArrowLeftStartOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

interface LinkProps {
  text: string;
  to: string;
  icon: React.ReactNode;
}

export default function Layout() {

    const [pathname, setPathname] = useState(window.location.pathname);


  const Link = ({ text, to, icon }: LinkProps) => {
    const bgClass = pathname === to ? "bg-onyx-light" : "transition duration-125 hover:bg-onyx-light ";
    return (
      <RouterLink
        to={to}
        className={"flex items-center gap-2 p-2 rounded-2xl " + bgClass}
        onClick={() => setPathname(to)}
      >
        <div className="flex gap-2">
          {icon}
          <p>{text}</p>
        </div>
      </RouterLink>
    );
  };

  return (
    <>
    <header className="flex py-4 px-4 justify-between shadow-md items-center text-3xl dark:bg-onyx-light z-10">


    <RouterLink to='/'>
      <p className="flex items-center gap-2 font-semibold ">
            <FolderIcon className="w-[1.875rem] h-[1.875rem]"/>
            OnePlace
      </p>
    </RouterLink>


    <RouterLink to={'/settings'}>
      <Cog6ToothIcon className="h-9 hover:rotate-45 rounded-full transition duration-150"/>
    </RouterLink>
    </header>
        <div className="flex flex-grow w-full">
          <section className="w-72 flex-col flex border-r border-onyx-gray p-3 justify-between">
            <div className="gap-2 flex flex-col">
            <Link to="/" text="Home" icon={<FolderIcon className="w-6 h-6" />} />
            <Link to="/settings" text="Settings" icon={<Cog6ToothIcon className="w-6 h-6" />} />
            </div>
            
            <div className="w-full pt-2 border-t border-onyx-light">
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
