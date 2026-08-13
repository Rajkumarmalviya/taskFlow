import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ onClose, labelledBy, children, className = "" }: ModalProps) {
  return (
    <Dialog.Root defaultOpen onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />

        <Dialog.Content
          aria-labelledby={labelledBy}
          className={["fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl", className].join(" ")}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
