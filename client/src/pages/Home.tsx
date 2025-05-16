import Button from "@frontend/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { FolderIcon, Images, SettingsIcon } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full">
      <div className="flex-grow flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center gap-3 border border-gray-300 dark:border-onyx-light h-fit rounded-md p-12 max-w-[575px]">
          <h1 className="text-2xl font-bold">Welcome!</h1>
          <p className="text-center">
            This is your homepage. You can explore your photos, browse
            collections, or adjust your user settings.
          </p>

          <Button onClick={() => navigate("/photos")}>
            <Images className="h-7" />
            Explore Photos
          </Button>

          <Button onClick={() => navigate("/collections")} variant="outlined">
            <FolderIcon className="h-7" />
            Browse Collections
          </Button>

          <Button onClick={() => navigate("/settings")} variant="outlined">
            <SettingsIcon className="h-7" />
            User Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
