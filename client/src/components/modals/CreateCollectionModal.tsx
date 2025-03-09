import { Field } from "@headlessui/react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import LabelledInput from "../ui/LabelledInput";
import { TabPanel, Tabs } from "../ui/Tabs";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@frontend/utils/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "create" | "add";
};

export default function CreateCollectionModal({
  isOpen,
  onClose,
  initialTab = "create",
}: Props) {
  const { mutateAsync } = useMutation({
    mutationFn: (data: { name: string; description: string }) => {
      return api.createCollection(data);
    },
  });

  const [tab, setTab] = useState(initialTab);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");

    if (tab === "create") {
      console.log("Create collection");
      const name = (
        e.currentTarget.elements.namedItem("name") as HTMLInputElement
      ).value;
      const description = (
        e.currentTarget.elements.namedItem("description") as HTMLInputElement
      ).value;

      toast.promise(
        mutateAsync({ name, description }),
        {
          loading: "Creating collection...",
          success: "Collection created!",
          error: "Failed to create collection",
        })

      console.log(name, description);
    } else {
      console.log("Add to collection");
    }

    onClose();
  };

  const handleTabChange = (tabIndex: number) => {
    setTab(tabIndex === 0 ? "create" : "add");
  };

  return (
    <Modal title="Collection Manager" isOpen={isOpen} onClose={onClose}>
      <Tabs
        tabs={["Create new collection", "Add to existing collection"]}
        selectedTab={initialTab === "create" ? 0 : 1}
        onTabChange={handleTabChange}
      >
        <TabPanel>
          <form className="w-full" onSubmit={handleSubmit}>
            <div>
              <Field>
                <LabelledInput
                  label="Name"
                  id="name"
                  type="text"
                  placeholder="Collection name..."
                />
              </Field>
              <Field>
                <LabelledInput
                  label="Description"
                  id="description"
                  type="text"
                  placeholder="Description..."
                />
              </Field>
            </div>
            <Button type="submit" className="w-full mt-2">
              Create collection
            </Button>
          </form>
        </TabPanel>
        <TabPanel>
          <form className="w-full" onSubmit={handleSubmit}>
            <Field>
              <LabelledInput label="Collection" id="collection" type="text" />
            </Field>
            <Button type="submit" className="w-full mt-2">
              Add to collection
            </Button>
          </form>
        </TabPanel>
      </Tabs>
    </Modal>
  );
}
