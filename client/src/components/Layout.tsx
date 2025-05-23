import {
  Navigate,
  Outlet,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthProvider";
import Button from "./ui/Button";
import UploadPhotosModal from "./modals/UploadPhotosModal";
import { useState } from "react";

import {
  House as HouseIcon,
  Radius as RadiusIcon,
  FolderOpen as FolderIcon,
  Settings as SettingsIcon,
  Clock as ClockIcon,
  Images,
  ImagePlus,

} from 'lucide-react'

interface LinkProps {
  text: string;
  to: string;
  icon: React.ReactNode;
}

const Link = ({ text, to, icon }: LinkProps) => {
  const { pathname } = useLocation();
  const bgClass =
    pathname === to
      ? "bg-onyx-light"
      : "transition duration-125 hover:bg-onyx-light ";
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
        <section id="sidebar" className="w-60 flex-col flex border-r border-gray-300 dark:border-onyx-light bg-onyx-gray text-white p-3 px-0 relative">
        <RouterLink
              to="/"
              className="text-3xl text-center font-bold flex gap-2 items-center my-2 h-10 px-3"
            >
              <RadiusIcon className="w-10 h-10 bg-indigo rounded-md p-2" />
              OnePlace
            </RouterLink>

            <hr className="!border-onyx-light !mt-0 mb-4"/>

          <div className="gap-2 flex flex-col px-3" id="nav-links">
          
            <Link to="/" text="Home" icon={<HouseIcon className="w-6" />} />
            <Link
              to="/photos"
              text="Photos"
              icon={<Images className="w-6" />}
            />
            <Link
              to="/collections"
              text="Collections"
              icon={<FolderIcon className="w-6" />}
            />
            <Link
              to="/settings"
              text="Settings"
              icon={<SettingsIcon className="w-6" />}
            />
          </div>

          <hr className="!border-onyx-light my-4"/>

          <div id="recently-accessed" className="flex flex-col gap-2">
            
          <span className="flex gap-2 justify-center items-center">
            <ClockIcon className="w-6 " />
            <p className="text-center text-lg font-semibold ">
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
                <ImagePlus className="w-6" />
                <p>Upload Photos</p>
              </Button>
            </div>
          </div>
        </section>
        <Outlet />
      </div>
  );
}
