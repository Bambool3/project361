"use client";

import { Role, RoleFormData } from "@/types/role";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const roleSchema = z.object({
    name: z
        .string()
        .min(1, "กรุณาระบุชื่อตำแหน่ง ")
        .min(2, "ชื่อตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร")
        .max(100, "ชื่อตำแหน่งต้องไม่เกิน 100 ตัวอักษร"),
});

type FormData = z.infer<typeof roleSchema>;

interface RoleAddEditProps {
    role?: Role | null;
    onSubmit: (data: RoleFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function RoleAddEdit({
    role,
    onSubmit,
    onCancel,
    loading: externalLoading = false,
}: RoleAddEditProps) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = externalLoading || submitLoading;
    const isEditMode = !!role;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: role?.name || "",
        },
    });

    const handleFormSubmit = async (data: FormData) => {
        try {
            setSubmitLoading(true);
            setSubmitError(null);
            await onSubmit(data);
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "เกิดข้อผิดพลาดที่ไม่คาดคิด"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        setSubmitError(null);
        onCancel();
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            sx={{ width: "100%", p: 3 }}
        >
            {submitError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: "12px",
                    }}
                    onClose={() => setSubmitError(null)}
                >
                    {submitError}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: "600",
                        color: "#374151",
                        mb: 1,
                    }}
                >
                    ชื่อตำแหน่ง *
                </Typography>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isLoading}
                            placeholder="กรุณาระบุชื่อตำแหน่ง"
                            onChange={(e) => {
                                field.onChange(e);
                                setSubmitError(null);
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                    backgroundColor: "#f8fafc",
                                    "&:hover fieldset": {
                                        borderColor: "#8b5cf6",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#8b5cf6",
                                    },
                                },
                            }}
                        />
                    )}
                />
            </Box>

            {/* Action Buttons */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={handleCancel}
                    disabled={isLoading}
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
                    ยกเลิก
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    variant="contained"
                    startIcon={
                        isLoading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : null
                    }
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
                    {isLoading
                        ? "กำลังดำเนินการ..."
                        : isEditMode
                        ? "บันทึกการแก้ไข"
                        : "เพิ่มตำแหน่ง"}
                </Button>
            </Box>
        </Box>
    );
}
