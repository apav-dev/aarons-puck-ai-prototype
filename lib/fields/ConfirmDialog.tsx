"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  bullets?: string[];
  confirmLabel: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  bullets,
  confirmLabel,
  confirmDanger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : null)}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0"
        style={{ width: "min(520px, calc(100vw - 48px))" }}
      >
        {/* Title */}
        <div className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </div>

        {/* Message */}
        <div className="px-6 pb-4 text-sm leading-relaxed text-gray-600">
          {message}
        </div>

        {/* Bullets */}
        {bullets && bullets.length > 0 && (
          <div className="mx-6 mb-5 rounded-lg bg-indigo-50 px-5 py-4">
            <ul className="flex flex-col gap-2">
              {bullets.map((bullet, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm font-medium text-indigo-900"
                >
                  <span className="mt-0.5 text-indigo-400">&bull;</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={
              confirmDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
