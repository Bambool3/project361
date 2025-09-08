"use client";

import { EmployeeFormData, Department, Role, Employee } from "@/types/employee";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ConfirmModal from "@/components/ui/confirm-modal";

// Zod schema for validation
const createEmployeeSchema = (isEditMode: boolean) =>
    z.object({
        first_name: z
            .string()
            .min(1, "กรุณาระบุชื่อ")
            .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
            .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"),
        last_name: z
            .string()
            .min(1, "กรุณาระบุนามสกุล")
            .min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร")
            .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร"),
        email: z
            .string()
            .min(1, "กรุณาระบุอีเมล")
            .email("รูปแบบอีเมลไม่ถูกต้อง"),
        password: isEditMode
            ? z
                  .string()
                  .min(0)
                  .optional()
                  .or(
                      z
                          .string()
                          .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
                          .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร")
                  )
            : z
                  .string()
                  .min(1, "กรุณาระบุรหัสผ่าน")
                  .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
                  .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร"),
        role_id: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
        department_id: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
    });

type FormData = z.infer<ReturnType<typeof createEmployeeSchema>>;

interface EmployeeAddEditProps {
    initialData?: Employee;
    departments: Department[];
    roles: Role[];
    onSubmit: (data: EmployeeFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function EmployeeAddEdit({
    initialData,
    departments,
    roles,
    onSubmit,
    onCancel,
    loading: externalLoading = false,
}: EmployeeAddEditProps) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(
        null
    );

    const isLoading = externalLoading || submitLoading;
    const isEditMode = !!initialData;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(createEmployeeSchema(isEditMode)),
        defaultValues: {
            first_name: initialData?.first_name || "",
            last_name: initialData?.last_name || "",
            email: initialData?.email || "",
            password: "",
            role_id: initialData?.role_id || "",
            department_id: initialData?.department_id || "",
        },
    });

    const submitForm = async (data: FormData) => {
        setPendingFormData(data);
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        if (!pendingFormData) return;

        try {
            setSubmitLoading(true);
            setSubmitError(null);
            setShowConfirmModal(false);

            const trimmedData: EmployeeFormData = {
                first_name: pendingFormData.first_name.trim(),
                last_name: pendingFormData.last_name.trim(),
                email: pendingFormData.email.trim(),
                password: pendingFormData.password || "",
                role_id: pendingFormData.role_id,
                department_id: pendingFormData.department_id,
            };

            if (isEditMode && !pendingFormData.password?.trim()) {
                trimmedData.password = "";
            }

            await onSubmit(trimmedData);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            setSubmitError(errorMessage);
        } finally {
            setSubmitLoading(false);
            setPendingFormData(null);
        }
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setPendingFormData(null);
    };

    const getSelectedDepartmentName = (departmentId: string) => {
        return (
            departments.find((dept) => dept.id === departmentId)
                ?.department_name || ""
        );
    };

    const getSelectedRoleName = (roleId: string) => {
        return roles.find((role) => role.id === roleId)?.role_name || "";
    };

    return (
        <>
            <Box
                component="form"
                onSubmit={handleSubmit(submitForm)}
                sx={{ width: "100%", p: 3 }}
            >
                {submitError && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: "12px" }}
                        onClose={() => setSubmitError(null)}
                    >
                        {submitError}
                    </Alert>
                )}

                <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                    {/* First Name */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1,
                            }}
                        >
                            ชื่อ *
                        </Typography>
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    placeholder="ระบุชื่อ..."
                                    error={!!errors.first_name}
                                    helperText={errors.first_name?.message}
                                    disabled={isLoading}
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

                    {/* Last Name */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1,
                            }}
                        >
                            นามสกุล *
                        </Typography>
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    placeholder="ระบุนามสกุล..."
                                    error={!!errors.last_name}
                                    helperText={errors.last_name?.message}
                                    disabled={isLoading}
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
                </Box>

                <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                    {/* Department Dropdown */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1,
                            }}
                        >
                            หน่วยงาน *
                        </Typography>
                        <Controller
                            name="department_id"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    fullWidth
                                    error={!!errors.department_id}
                                    disabled={isLoading}
                                >
                                    <Select
                                        {...field}
                                        displayEmpty
                                        sx={{
                                            borderRadius: "12px",
                                            backgroundColor: "#f8fafc",
                                            "&:hover .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor: "#8b5cf6",
                                                },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor: "#8b5cf6",
                                                },
                                        }}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSubmitError(null);
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <Typography
                                                sx={{ color: "#9ca3af" }}
                                            >
                                                เลือกหน่วยงาน
                                            </Typography>
                                        </MenuItem>
                                        {departments.map((department) => (
                                            <MenuItem
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.department_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.department_id && (
                                        <FormHelperText>
                                            {errors.department_id.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Box>

                    {/* Role Dropdown */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1,
                            }}
                        >
                            ตำแหน่ง *
                        </Typography>
                        <Controller
                            name="role_id"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    fullWidth
                                    error={!!errors.role_id}
                                    disabled={isLoading}
                                >
                                    <Select
                                        {...field}
                                        displayEmpty
                                        sx={{
                                            borderRadius: "12px",
                                            backgroundColor: "#f8fafc",
                                            "&:hover .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor: "#8b5cf6",
                                                },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor: "#8b5cf6",
                                                },
                                        }}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setSubmitError(null);
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <Typography
                                                sx={{ color: "#9ca3af" }}
                                            >
                                                เลือกตำแหน่ง
                                            </Typography>
                                        </MenuItem>
                                        {roles.map((role) => (
                                            <MenuItem
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.role_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.role_id && (
                                        <FormHelperText>
                                            {errors.role_id.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Box>
                </Box>

                {/* Email */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: "600",
                            color: "#374151",
                            mb: 1,
                        }}
                    >
                        อีเมล *
                    </Typography>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                type="email"
                                placeholder="ระบุอีเมล..."
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                disabled={isLoading}
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

                {/* Password */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: "600",
                            color: "#374151",
                            mb: 1,
                        }}
                    >
                        รหัสผ่าน *{" "}
                        {isEditMode && (
                            <Typography
                                component="span"
                                sx={{ color: "#64748b", fontSize: "0.875rem" }}
                            >
                                (ใส่รหัสผ่านใหม่หากต้องการเปลี่ยน)
                            </Typography>
                        )}
                    </Typography>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                type="password"
                                placeholder={
                                    isEditMode
                                        ? "ระบุรหัสผ่านใหม่..."
                                        : "ระบุรหัสผ่าน..."
                                }
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                disabled={isLoading}
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
                        onClick={onCancel}
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
                        {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
                    </Button>
                </Box>
            </Box>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={showConfirmModal}
                onClose={handleCancelConfirm}
                onConfirm={handleConfirmSubmit}
                title={`ยืนยันการ${isEditMode ? "แก้ไข" : "เพิ่ม"}บุคลากร`}
                message={`คุณต้องการ${
                    isEditMode ? "บันทึกการแก้ไข" : "เพิ่ม"
                }บุคลากรนี้หรือไม่?`}
                confirmText={isEditMode ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
                cancelText="ยกเลิก"
                loading={isLoading}
                severity="info"
            >
                {pendingFormData && (
                    <Box
                        sx={{
                            backgroundColor: "#f8fafc",
                            padding: 2,
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "600", color: "#374151", mb: 1 }}
                        >
                            ชื่อ-นามสกุล: {pendingFormData.first_name}{" "}
                            {pendingFormData.last_name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "#64748b", mb: 1 }}
                        >
                            อีเมล: {pendingFormData.email}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "#64748b", mb: 1 }}
                        >
                            หน่วยงาน:{" "}
                            {getSelectedDepartmentName(
                                pendingFormData.department_id
                            )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                            ตำแหน่ง:{" "}
                            {getSelectedRoleName(pendingFormData.role_id)}
                        </Typography>
                    </Box>
                )}
            </ConfirmModal>
        </>
    );
}
