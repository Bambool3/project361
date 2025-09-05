import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
    Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface CustomModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    showActions?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    disableBackdropClick?: boolean;
}

export default function CustomModal({
    open,
    onClose,
    title,
    children,
    maxWidth = "sm",
    showActions = true,
    onConfirm,
    onCancel,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    loading = false,
    disableBackdropClick = false,
}: CustomModalProps) {
    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const handleBackdropClick = (event: {}, reason: string) => {
        if (disableBackdropClick && reason === "backdropClick") {
            return;
        }
        handleClose();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleBackdropClick}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    p: 3,
                    pb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #f1f5f9",
                    fontWeight: "bold",
                    color: "#1e293b",
                }}
            >
                {title}
                <IconButton
                    onClick={handleClose}
                    disabled={loading}
                    size="small"
                    sx={{
                        color: "#64748b",
                        "&:hover": {
                            backgroundColor: "#f8fafc",
                        },
                    }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 3,
                    py: 2,
                }}
            >
                {children}
            </DialogContent>

            {showActions && (
                <DialogActions
                    sx={{
                        p: 3,
                        pt: 2,
                        gap: 2,
                        borderTop: "1px solid #f1f5f9",
                    }}
                >
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                            color: "#64748b",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderRadius: "12px",
                            "&:hover": {
                                backgroundColor: "#f8fafc",
                            },
                        }}
                    >
                        {cancelText}
                    </Button>
                    {onConfirm && (
                        <Button
                            onClick={onConfirm}
                            disabled={loading}
                            variant="contained"
                            sx={{
                                backgroundColor: "#8b5cf6",
                                color: "white",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                borderRadius: "12px",
                                "&:hover": {
                                    backgroundColor: "#7c3aed",
                                },
                                "&:disabled": {
                                    backgroundColor: "#cbd5e1",
                                },
                            }}
                        >
                            {confirmText}
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
}
