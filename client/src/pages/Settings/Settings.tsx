import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";
import Panel from "../../components/ui/Panel";
import { GoogleClientIntegration, SettingKeyType } from "@shared/types";
import { UserSettingsKeys } from "@shared/constants";
import ToggleSetting from "./ToggleSetting";
import { CloudIcon, MoonIcon, UserIcon } from "@heroicons/react/24/outline";
import SettingAction from "./SettingAction";
import IconButton from "@frontend/components/ui/IconButton";

export default function Settings() {
  const user = useAuth().user!;
  const { setSettingsContext, logout } = useAuth();
  const settings = user.settings;
  const integrations = user.integrations;

  const queryClient = useQueryClient();

  const { mutate: disconnectIntegration, isPending } = useMutation({
    mutationFn: (integration: string) => api.disconnectIntegration(integration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const { mutate: updateSetting, isPending: isPendingSetting } = useMutation({
    mutationFn: (setting: { key: SettingKeyType; value: string }) => {
      return api.updateSetting(setting);
    },
    onSuccess: (data) => {
      setSettingsContext({ ...settings, [data.key]: data.value });
    },
  });
  


  return (
    <div className="flex-grow flex flex-col justify-start w-full p-5">

      <span className="justify-between w-full pb-4">
      <p className="text-4xl font-bold">Settings</p>
      <IconButton icon={<MoonIcon className="h-10 p-1" />} onClick={toggleDarkMode} />
      </span>

      <Panel className="w-full flex flex-col p-8">
        <span className="text-2xl font-bold indigo-underline">
          <CloudIcon className="h-6 w-6 mr-2 stroke-2" />
          <p>Cloud Storage</p>
        </span>
        <p>
          Manage your connected Cloud Storage vendors and control auto-upload
          behaviour
        </p>
        <div className="px-4 w-full mx-auto">
          <div className="flex justify-between items-center py-2">
            <SettingAction
              title="Google Photos"
              subtitle={getIntegrationActionValues(integrations["google"]).status}
              buttonText={getIntegrationActionValues(integrations["google"]).action}
              buttonVariant={getIntegrationActionValues(integrations["google"]).buttonVariant}
              onClick={() => disconnectIntegration("google")}
              loading={isPending} />
          </div>
          <ToggleSetting
            label="Automatically upload new photos to Google Photos"
            checked={settings[UserSettingsKeys.GOOGLE_AUTO_UPLOAD] === "true"}
            onChange={(checked) =>
              updateSetting({
                key: UserSettingsKeys.GOOGLE_AUTO_UPLOAD,
                value: checked.toString(),
              })
            }
            disabled={isPendingSetting}
          />
        </div>
      </Panel>

      <Panel className="w-full flex flex-col mt-4 p-8">
        <span className="indigo-underline text-2xl font-bold">
          <UserIcon className="h-6 w-6 mr-2 stroke-2" />
          <p>Account</p>
        </span>
      <p>Manage your account and data.</p>

      <SettingAction
        title="Logout"
        subtitle="Logout from your account and clear all session data."
        buttonText="Logout"
        buttonVariant="outlined"
        onClick={logout}
        loading={false}
      />

      <SettingAction
        title="Delete All Photos"
        subtitle="Delete all photos from your account. This action is irreversible."
        buttonText="Delete"
        buttonVariant="danger"
        onClick={() => {}}
        loading={false}
        className="mt-2"
      />

      <SettingAction
        title="Delete Account"
        subtitle="Delete your account and all associated data. This action is irreversible."
        buttonText="Delete"
        buttonVariant="danger"
        onClick={() => {}}
        loading={false}
        className="mt-2"
      />

    </Panel>

    </div>
  );
}


//helper functions

function getIntegrationActionValues(integration: GoogleClientIntegration | undefined): { status: string; action: string; buttonVariant: "filled" | "outlined" | "danger" } {
  if (!integration) {
    return {
      status: "Not Connected",
      action: "Connect",
      buttonVariant: "filled",
    };
  }

  return {
    status: "Connected",
    action: "Disconnect",
    buttonVariant: "danger",
  };
}

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