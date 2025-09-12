"use client";

import { JobFormData, Job } from "@/types/job";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

// Zod schema for validation
const jobSchema = z.object({
    name: z
        .string()
        .min(1, "กรุณาระบุชื่อหน่วยงาน")
        .min(2, "ชื่อหน่วยงานต้องมีอย่างน้อย 2 ตัวอักษร")
        .max(100, "ชื่อหน่วยงานต้องไม่เกิน 100 ตัวอักษร"),
});

type FormData = z.infer<typeof jobSchema>;

interface JobAddEditProps {
    job?: Job | null;
    onSubmit: (data: JobFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function JobAddEdit({
    job,
    onSubmit,
    onCancel,
    loading: externalLoading = false,
}: JobAddEditProps) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = externalLoading || submitLoading;
    const isEditMode = !!job;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            name: job?.name || "",
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
                    ชื่อหน่วยงาน *
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
                            placeholder="กรุณาระบุชื่อหน่วยงาน"
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
                        : "เพิ่มหน่วยงาน"}
                </Button>
            </Box>
        </Box>
    );
}
