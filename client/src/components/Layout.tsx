import {
  Navigate,
  Outlet,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import {
  FolderIcon,
  Cog6ToothIcon,
  PhotoIcon,
  HomeIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "./AuthProvider";
import Button from "./ui/Button";
import UploadPhotosModal from "./modals/UploadPhotosModal";
import { useState } from "react";

interface LinkProps {
  text: string;
  to: string;
  icon: React.ReactNode;
}

const Link = ({ text, to, icon }: LinkProps) => {
  const { pathname } = useLocation();
  const bgClass =
    pathname === to
      ? "bg-gray-200 dark:bg-onyx-light"
      : "transition duration-125 hover:bg-gray-200 dark:hover:bg-onyx-light ";
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
  const { user, isLoading } = useAuth();

  const [uploadModal, setUploadModal] = useState(false);

  if (!user && !isLoading) {
    return <Navigate to="/login" />;
  }

  return (
      <div className="flex flex-grow w-full">
        <UploadPhotosModal isOpen={uploadModal} onClose={() => {setUploadModal(false)}}/>
        <section id="sidebar" className="w-60 flex-col flex border-r border-gray-300 dark:border-onyx-light bg-onyx-gray p-3 relative">
          <div className="gap-2 flex flex-col" id="nav-links">
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

          <hr />

          <div id="recently-accessed" className="flex flex-col gap-2">
            
          <span className="flex gap-2 justify-center items-center">
            <ClockIcon className="w-6 dark:text-gray-400" />
            <p className="text-center text-lg font-semibold dark:text-gray-400">
              Recently Accessed
            </p>
          </span>

          </div>

          <div
            className="w-full p-2 py-1 absolute bottom-0 left-0 "
            id="logout-button"
          >
            <div className="py-1 border-t border-gray-300 dark:border-onyx-light">
              <Button
                className="mt-2 "
                onClick={() => {
                  setUploadModal(true);
                }}
              >
                <ArrowUpTrayIcon className="w-6" />
                <p>Upload Photos</p>
              </Button>
            </div>
          </div>
        </section>
        <Outlet />
      </div>
  );
}
