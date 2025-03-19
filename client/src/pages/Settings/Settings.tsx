import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../components/AuthProvider";
import api from "../../utils/api";
import Panel from "../../components/ui/Panel";
import { GoogleClientIntegration, SettingKeyType } from "@shared/types";
import { UserSettingsKeys } from "@shared/constants";
import ToggleSetting from "./ToggleSetting";
import SettingAction from "./SettingAction";
import IconButton from "@frontend/components/ui/IconButton";
import { useReducer } from "react";
import ConfirmationModal from "@frontend/components/modals/ConfirmationModal";
import toast from "react-hot-toast";
import { Cloud, SunMoon, User } from "lucide-react";

export default function Settings() {
  const user = useAuth().user!;
  const { updateUser, logout } = useAuth();
  const settings = user.settings;
  const integrations = user.integrations;

  const { mutate: disconnectIntegrationMutation, isPending } = useMutation({
    mutationFn: (integration: string) => api.auth.disconnectIntegration(integration),
  });

  const { mutate: updateSettingMutation, isPending: isPendingSetting } = useMutation({
    mutationFn: (setting: { key: SettingKeyType; value: string }) => {
      return api.user.updateSetting(setting);
    },
  });

  const updateSetting = async (setting: { key: SettingKeyType; value: string }) => {
    await updateSettingMutation(setting);
    updateUser({ ...user, settings: { ...settings, [setting.key]: setting.value } });
  }

  const disconnectIntegration = async (integration: string) => {
    await disconnectIntegrationMutation(integration);
    const updatedIntegrations = { ...integrations };
    delete updatedIntegrations[integration];
    updateUser({ ...user, integrations: updatedIntegrations });
  };

  interface ModalState {
    action: () => void;
    text: string | undefined;
    isOpen: boolean;
  }
  const modalReducer = (
    state: ModalState,
    action: { type: string; payload?: Omit<ModalState, "isOpen"> }
  ) => {
    switch (action.type) {
      case "OPEN":
        return { ...state, isOpen: true, ...action.payload };
      case "CLOSE":
        return { action: () => {}, text: undefined, isOpen: false };
      default:
        return state;
    }
  };

  const [modalState, dispatchModal] = useReducer(modalReducer, {
    isOpen: false,
    action: () => {},
    text: undefined,
  });

  const deletePhotos = () => {
    toast.promise(
      api.req("/photos/delete-all", { method: "DELETE", throwError: true }),
      {
        loading: "Deleting photos...",
        success: "Photos deleted successfully",
        error: "Failed to delete photos",
      }
    )  };

  const deleteAccount = () => {
    console.log("delete account");
    alert("Not implemented yet");
  };

  return (
    <div className="flex-grow flex flex-col justify-start w-full p-5">
      <ConfirmationModal
        isOpen={modalState.isOpen}
        text={modalState.text}
        onConfirm={modalState.action}
        onClose={() => {
          dispatchModal({ type: "CLOSE" });
        }}
      />

      <span className="justify-between w-full pb-4">
        <p className="text-4xl font-bold indigo-underline">Settings</p>
        <IconButton
          icon={<SunMoon className="h-10 w-10 p-1" />}
          onClick={toggleDarkMode}
        />
      </span>

      <Panel className="w-full flex flex-col p-8">
        <span className="text-2xl font-bold indigo-underline">
          <Cloud className="h-6 w-6 mr-2 stroke-2" />
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
              subtitle={
                getIntegrationActionValues(integrations["google"]).status
              }
              buttonText={
                getIntegrationActionValues(integrations["google"]).action
              }
              buttonVariant={
                getIntegrationActionValues(integrations["google"]).buttonVariant
              }
              onClick={
                getIntegrationActionValues(integrations["google"]).action ===
                "Disconnect"
                  ? () => disconnectIntegration("google")
                  : () => {
                      window.location.href = "/api/auth/google";
                    }
              }
              loading={isPending}
            />
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
            disabled={
              isPendingSetting ||
              getIntegrationActionValues(integrations["google"]).action !==
                "Disconnect"
            }
          />
        </div>
      </Panel>

      {/* ACCOUNT SETTINGS */}
      <Panel className="w-full flex flex-col mt-4 p-8">
        <span className="indigo-underline text-2xl font-bold">
          <User className="h-6 w-6 mr-2 stroke-2" />
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
          onClick={() => {
            dispatchModal({
              type: "OPEN",
              payload: {
                action: deletePhotos,
                text: "Are you sure you want to delete all photos? This action is irreversible.",
              },
            });
          }}
          loading={false}
          className="mt-2"
        />

        <SettingAction
          title="Delete Account"
          subtitle="Delete your account and all associated data. This action is irreversible."
          buttonText="Delete"
          buttonVariant="danger"
          onClick={() => {
            dispatchModal({
              type: "OPEN",
              payload: {
                action: deleteAccount,
                text: "Are you sure you want to delete your account? This action is irreversible.",
              },
            });
          }}
          loading={false}
          className="mt-2"
        />
      </Panel>

      <Panel className="w-full flex flex-col mt-4 p-8">
        <p className="text-2xl indigo-underline font-bold">Photo Management</p>
        <ToggleSetting label="Enable photo compression" checked={settings[UserSettingsKeys.COMPRESS_BEFORE_UPLOAD] === 'true'} onChange={(checked) => {
          updateSetting({ key: UserSettingsKeys.COMPRESS_BEFORE_UPLOAD, value: checked.toString() })
        }} />
      </Panel>
    </div>
  );
}

//helper functions

function getIntegrationActionValues(
  integration: GoogleClientIntegration | undefined
): {
  status: string;
  action: string;
  buttonVariant: "filled" | "outlined" | "danger";
} {
  if (!integration) {
    return {
      status: "Not Connected",
      action: "Connect",
      buttonVariant: "filled",
    };
  }

  return {
    status: `Connected as ${integration.email}`,
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
