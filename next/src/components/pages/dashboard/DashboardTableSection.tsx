// components/DashboardTableSection.tsx
"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import CustomTable from "@/components/ui/custom-table";
import { Category, CategoryFormData } from "@/types/category";
import { CategoryService } from "@/server/services/category/category-client-service";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material";
import { Plus, Edit, Trash2, Tags } from "lucide-react";
import { useState } from "react";
import DashboardAddCategory from "./DashboardAdd&Edit";

interface DashboardTableSectionProps {
    categories: Category[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function DashboardTableSection({
    categories,
    loading,
    error,
    onRefresh,
}: DashboardTableSectionProps) {
    const router = useRouter();

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null
    );

    // Snackbar states
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<
        "error" | "success" | "warning" | "info"
    >("success");

    // Alert helper functions
    const showAlert = (
        message: string,
        severity: "error" | "success" | "warning" | "info" = "success"
    ) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    const handleCloseAlert = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setAlertOpen(false);
    };

    const handleRowClick = (category: Category) => {
        router.push(`/admin/management?categoryId=${category.id}`);
    };

    const handleAddCategory = () => {
        setIsAddModalOpen(true);
    };

    const handleAddCategorySubmit = async (formData: CategoryFormData) => {
        try {
            const statusCode = await CategoryService.createCategoryWithStatus(
                formData
            );

            if (statusCode === 201) {
                setIsAddModalOpen(false);
                showAlert("เพิ่มหมวดหมู่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (statusCode === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (statusCode === 409) {
                showAlert(
                    "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อหมวดหมู่",
                    "warning"
                );
            } else if (statusCode === 500) {
                showAlert(
                    "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
                    "error"
                );
            } else {
                showAlert("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่", "error");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleEditCategory = (category: Category, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleEditCategorySubmit = async (formData: CategoryFormData) => {
        if (!selectedCategory) return;

        try {
            const statusCode = await CategoryService.updateCategoryWithStatus(
                selectedCategory.id,
                formData
            );

            if (statusCode === 200) {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                showAlert("แก้ไขหมวดหมู่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (statusCode === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (statusCode === 404) {
                showAlert("ไม่พบหมวดหมู่ที่ต้องการแก้ไข", "error");
            } else if (statusCode === 409) {
                showAlert(
                    "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อหมวดหมู่",
                    "warning"
                );
            } else if (statusCode === 500) {
                showAlert(
                    "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
                    "error"
                );
            } else {
                showAlert("เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่", "error");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleDeleteCategory = (category: Category, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCategoryConfirm = async () => {
        if (!categoryToDelete) return;

        try {
            const response = await fetch(
                `/api/category/${categoryToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
                showAlert("ลบหมวดหมู่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                const data = await response.json();
                showAlert(
                    data.error || "ไม่สามารถลบหมวดหมู่ที่มี'ตัวชี้วัด'อยู่ได้",
                    "warning"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบหมวดหมู่ที่ต้องการลบ", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดในการลบหมวดหมู่", "error");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const columns = [
        {
            id: "name",
            label: "ชื่อหมวดหมู่",
            searchable: true,
            render: (category: Category, index: number) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: "#8b5cf6",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                        }}
                    >
                        {index + 1}
                    </Box>
                    <Typography sx={{ fontWeight: "600", color: "#1e293b" }}>
                        {category.name}
                    </Typography>
                </Box>
            ),
        },
        {
            id: "description",
            label: "รายละเอียด",
            searchable: true,
            render: (category: Category) => (
                <Typography sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {category.description}
                </Typography>
            ),
        },
        {
            id: "indicators",
            label: "จำนวนตัวชี้วัด",
            align: "center" as const,
            render: (category: Category) => (
                <Chip
                    label={`${category.indicators?.length || 0} ตัวชี้วัด`}
                    size="small"
                    sx={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: "600",
                    }}
                />
            ),
        },
        {
            id: "created_at",
            label: "วันที่สร้าง",
            align: "center" as const,
            render: (category: Category) => (
                <Typography sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {new Date(category.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </Typography>
            ),
        },
        {
            id: "actions",
            label: "จัดการ",
            align: "center" as const,
            render: (category: Category) => (
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip
                        title="แก้ไขข้อมูลหมวดหมู่"
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: "#1e293b",
                                    color: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    fontSize: "0.875rem",
                                },
                            },
                            arrow: { sx: { color: "#1e293b" } },
                        }}
                    >
                        <IconButton
                            onClick={(e) => handleEditCategory(category, e)}
                            size="small"
                            sx={{
                                color: "#64748b",
                                "&:hover": {
                                    color: "#8b5cf6",
                                    backgroundColor: "#f1f5f9",
                                },
                            }}
                        >
                            <Edit size={16} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title="ลบหมวดหมู่นี้ออกจากระบบ"
                        arrow
                        placement="top"
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: "#1e293b",
                                    color: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    fontSize: "0.875rem",
                                },
                            },
                            arrow: { sx: { color: "#1e293b" } },
                        }}
                    >
                        <IconButton
                            onClick={(e) => handleDeleteCategory(category, e)}
                            size="small"
                            sx={{
                                color: "#64748b",
                                "&:hover": {
                                    color: "#ef4444",
                                    backgroundColor: "#fef2f2",
                                },
                            }}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const headerActions = (
        <Tooltip
            title="สร้างหมวดหมู่ใหม่"
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: "#1e293b",
                        color: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        fontSize: "0.875rem",
                    },
                },
                arrow: { sx: { color: "#1e293b" } },
            }}
        >
            <Button
                onClick={handleAddCategory}
                startIcon={<Plus size={18} />}
                sx={{
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: "12px",
                    "&:hover": { backgroundColor: "#7c3aed" },
                }}
            >
                เพิ่มหมวดหมู่
            </Button>
        </Tooltip>
    );

    return (
        <>
            <CustomTable
                data={categories}
                columns={columns}
                loading={loading}
                error={error}
                title="รายการหมวดหมู่"
                icon={<Tags size={24} color="#8b5cf6" />}
                searchPlaceholder="ค้นหาหมวดหมู่..."
                onRowClick={handleRowClick}
                onRefresh={onRefresh}
                emptyMessage="ไม่มีข้อมูลหมวดหมู่"
                searchableFields={["name", "description"]}
                headerAction={headerActions}
            />

            {/* Add Modal */}
            <CustomModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="เพิ่มหมวดหมู่ใหม่"
                maxWidth="md"
                showActions={false}
            >
                <DashboardAddCategory
                    onSubmit={handleAddCategorySubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </CustomModal>

            {/* Edit Modal */}
            <CustomModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                title="แก้ไขหมวดหมู่"
                maxWidth="md"
                showActions={false}
            >
                <DashboardAddCategory
                    initialData={
                        selectedCategory
                            ? {
                                  name: selectedCategory.name,
                                  description: selectedCategory.description,
                              }
                            : undefined
                    }
                    onSubmit={handleEditCategorySubmit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedCategory(null);
                    }}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={handleDeleteCategoryConfirm}
                title="ยืนยันการลบหมวดหมู่"
                message="คุณต้องการลบหมวดหมู่นี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้"
                confirmText="ลบหมวดหมู่"
                cancelText="ยกเลิก"
                severity="error"
            >
                {categoryToDelete && (
                    <Box
                        sx={{
                            backgroundColor: "#fef2f2",
                            padding: 2,
                            borderRadius: "12px",
                            border: "1px solid #fecaca",
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "600", color: "#991b1b", mb: 1 }}
                        >
                            ชื่อหมวดหมู่: {categoryToDelete.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
                            รายละเอียด: {categoryToDelete.description}
                        </Typography>
                        {categoryToDelete.indicators &&
                            categoryToDelete.indicators.length > 0 && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#dc2626",
                                        mt: 1.5,
                                        fontWeight: "600",
                                    }}
                                >
                                    ⚠️ คำเตือน: หมวดหมู่นี้มี{" "}
                                    {categoryToDelete.indicators.length}{" "}
                                    ตัวชี้วัด
                                </Typography>
                            )}
                    </Box>
                )}
            </ConfirmModal>

            {/* Snackbar for notifications */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alertSeverity}
                    sx={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
