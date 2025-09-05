import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { ReactNode } from "react";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    children?: ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    severity?: "info" | "warning" | "error" | "success";
}

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    loading = false,
    children,
    maxWidth = "sm",
    severity = "info",
}: ConfirmModalProps) {
    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getConfirmButtonColor = () => {
        switch (severity) {
            case "error":
                return "#ef4444";
            case "warning":
                return "#f59e0b";
            case "success":
                return "#10b981";
            default:
                return "#8b5cf6";
        }
    };

    const getConfirmButtonHoverColor = () => {
        switch (severity) {
            case "error":
                return "#dc2626";
            case "warning":
                return "#d97706";
            case "success":
                return "#059669";
            default:
                return "#7c3aed";
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                    fontWeight: "bold",
                    color: "#1e293b",
                    borderBottom: "1px solid #f1f5f9",
                    mb: 2,
                }}
            >
                {title}
            </DialogTitle>

            <DialogContent sx={{ p: 3, py: 2 }}>
                <Typography sx={{ color: "#64748b", mb: children ? 2 : 0 }}>
                    {message}
                </Typography>
                {children}
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    pt: 2,
                    gap: 2,
                    borderTop: "1px solid #f1f5f9",
                }}
            >
                <Button
                    onClick={handleClose}
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
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    startIcon={
                        loading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : null
                    }
                    sx={{
                        backgroundColor: getConfirmButtonColor(),
                        color: "white",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: "12px",
                        "&:hover": {
                            backgroundColor: getConfirmButtonHoverColor(),
                        },
                        "&:disabled": {
                            backgroundColor: "#cbd5e1",
                        },
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
