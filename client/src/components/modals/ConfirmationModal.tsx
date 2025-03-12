import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { CircleAlert } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text?: string;
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  text = "This action cannot be undone",
}: Props) {
  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Are you sure?" icon={<CircleAlert className="w-6"/>}>
      <div className="p-6 space-y-4">
        <p>{text}</p>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="danger">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}