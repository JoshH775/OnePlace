import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../components/AuthContext/AuthProvider";
import api from "../../utils/api";
import Panel from "../../components/ui/Panel";
import { SettingKeyType } from "@shared/types";
import { UserSettingsKeys } from "@shared/constants";
import ToggleSetting from "./ToggleSetting";
import Button from "@frontend/components/ui/Button";

export default function Settings() {
  const user = useAuth().user!;
  const setSettingsContext = useAuth().setSettingsContext;
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

  function IntegrationConnection({
    name,
    integrationKey,
  }: {
    name: string;
    integrationKey: string;
  }) {
    const integration = integrations[integrationKey];
    const isConnected = !!integration;

    return (
      <div className="flex justify-between items-center py-2 w-full">
        <div className="flex flex-col w-full">
          <span className="font-semibold text-xl">{name}</span>
          <span className="text-sm text-gray-500">
            {isConnected
              ? `Connected as ${integration.email}`
              : "Not Connected"}
          </span>
        </div>
        <Button
          variant={isConnected ? "danger" : "filled"}
          className="!w-1/4"
          onClick={() =>
            isConnected
              ? disconnectIntegration(integrationKey)
              : (window.location.href = `/api/auth/${integrationKey}`)
          }
          disabled={isPending}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-start w-full p-5">
      <p className="text-4xl font-semibold pb-4">Settings</p>

      <Panel className="w-full flex flex-col">
        <p className="indigo-underline text-3xl font-bold">Cloud Services</p>
        <p>
          Manage your connected Cloud Storage vendors and control auto-upload
          behaviour
        </p>
        <div className="settings px-4 w-full mx-auto">
          <div className="flex justify-between items-center py-2">
            <IntegrationConnection
              name="Google Photos"
              integrationKey="google"
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
            disabled={isPendingSetting}
          />
        </div>
      </Panel>
    </div>
  );
}
