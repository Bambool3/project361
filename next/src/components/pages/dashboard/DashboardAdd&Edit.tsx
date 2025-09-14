"use client";

import { CategoryFormData } from "@/types/category";
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
import ConfirmModal from "@/components/ui/confirm-modal";

// Zod schema for validation
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "กรุณาระบุชื่อหมวดหมู่")
    .min(2, "ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "ชื่อหมวดหมู่ต้องไม่เกิน 50 ตัวอักษร"),
  description: z
    .string()
    .min(1, "กรุณาระบุรายละเอียด")
    .min(2, "รายละเอียดต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(200, "รายละเอียดต้องไม่เกิน 200 ตัวอักษร"),
});

type FormData = z.infer<typeof categorySchema>;

interface DashboardAddCategoryProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function DashboardAddCategory({
  initialData,
  onSubmit,
  onCancel,
  loading: externalLoading = false,
}: DashboardAddCategoryProps) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const isLoading = externalLoading || submitLoading;
  const isEditMode = !!initialData?.name;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const submitForm = async (data: FormData) => {
    // Show confirmation modals
    setPendingFormData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingFormData) return;

    try {
      setSubmitLoading(true);
      setSubmitError(null);
      setShowConfirmModal(false);

      const trimmedData = {
        name: pendingFormData.name.trim(),
        description: pendingFormData.description.trim(),
      };

      await onSubmit(trimmedData as CategoryFormData);
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

  return (
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

      {/* Category Name */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "600",
            color: "#374151",
            mb: 1,
          }}
        >
          ชื่อหมวดหมู่ *
        </Typography>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              placeholder="ระบุชื่อหมวดหมู่..."
              error={!!errors.name}
              helperText={errors.name?.message}
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

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "600",
            color: "#374151",
            mb: 1,
          }}
        >
          รายละเอียด *
        </Typography>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              placeholder="ระบุรายละเอียดของหมวดหมู่..."
              error={!!errors.description}
              helperText={errors.description?.message}
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
            isLoading ? <CircularProgress size={16} color="inherit" /> : null
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
          {isEditMode ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
        </Button>
      </Box>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmSubmit}
        title={`ยืนยันการ${isEditMode ? "แก้ไข" : "เพิ่ม"}หมวดหมู่`}
        message={`คุณต้องการ${
          isEditMode ? "บันทึกการแก้ไข" : "เพิ่ม"
        }หมวดหมู่นี้หรือไม่?`}
        confirmText={isEditMode ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
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
              ชื่อหมวดหมู่: {pendingFormData.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              รายละเอียด: {pendingFormData.description}
            </Typography>
          </Box>
        )}
      </ConfirmModal>
    </Box>
  );
}
