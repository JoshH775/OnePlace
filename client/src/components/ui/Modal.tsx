import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import IconButton from "./IconButton";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const animations = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.150 },
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open
          onClose={onClose}
          className="fixed inset-0 z-50 bg-black/50  w-full"
        >
          <motion.div
            id="motiondiv"
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={animations.transition}
            className="w-full h-full flex items-center justify-center"
          >
            <DialogPanel className="bg-white dark:bg-onyx rounded-lg p-6 w-1/3  max-w-[600px]">
              <div className="flex justify-between items-center mb-3">
                <DialogTitle className="text-2xl font-bold indigo-underline">
                  {title}
                </DialogTitle>
                <IconButton
                  icon={<XMarkIcon className="h-6" />}
                  onClick={onClose}
                  className="text-gray-500 dark:hover:!bg-onyx"
                />
              </div>
              {children}
            </DialogPanel>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
