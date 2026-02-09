import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const buttonBaseStyles = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
  background: "white",
  color: "var(--puck-color-grey-02, #292929)",
  cursor: "pointer",
} as const;

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
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : null)}>
      <DialogContent style={{ width: "min(520px, calc(100vw - 48px))" }}>
        <DialogHeader>
          <DialogTitle style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {confirmDanger && (
              <span style={{ color: "var(--puck-color-red-05, #dc2626)" }}>!</span>
            )}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div style={{ fontSize: "13px", color: "var(--puck-color-grey-05)" }}>
          {message}
        </div>
        {bullets && bullets.length > 0 && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: confirmDanger
                ? "rgba(220, 38, 38, 0.08)"
                : "rgba(37, 99, 235, 0.08)",
              color: confirmDanger
                ? "var(--puck-color-red-05, #dc2626)"
                : "var(--puck-color-blue-06, #2563eb)",
              fontSize: "12px",
            }}
          >
            {bullets.map((bullet, index) => (
              <div key={index} style={{ display: "flex", gap: "6px" }}>
                <span>•</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onCancel} style={buttonBaseStyles}>
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                ...buttonBaseStyles,
                background: confirmDanger
                  ? "var(--puck-color-red-05, #dc2626)"
                  : "var(--puck-color-blue-06, #2563eb)",
                color: "white",
                border: "none",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
