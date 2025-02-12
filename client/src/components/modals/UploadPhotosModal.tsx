import Modal from "../ui/Modal";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadPhotosModal({isOpen, onClose}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Photos">
            <div>
                <h1>Upload Photos</h1>
            </div>
        </Modal>
    )
}