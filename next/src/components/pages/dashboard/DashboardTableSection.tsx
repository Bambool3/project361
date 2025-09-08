"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Category, CategoryFormData } from "@/types/dashboard";
import { CategoryService } from "@/server/services/category/category-client-service";
import { useRouter } from "next/navigation";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Chip,
    InputAdornment,
    Alert,
    CircularProgress,
    TablePagination,
    Snackbar,
    Tooltip,
} from "@mui/material";
import { Search, Plus, Edit, Trash2, Tags } from "lucide-react";
import { useState, useMemo } from "react";
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

    // Search
    const [searchTerm, setSearchTerm] = useState<string>("");
    // Pagination
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null
    );
    // Snackbar
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

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        return categories.filter(
            (category) =>
                category.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                category.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // Paginated data
    const paginatedCategories = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredCategories.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredCategories, page, rowsPerPage]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (categoryId: string) => {
        router.push(`/management?categoryId=${categoryId}`);
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

    const handleEditCategory = (id: string) => {
        const category = categories.find((cat) => cat.id === id);
        if (category) {
            setSelectedCategory(category);
            setIsEditModalOpen(true);
        }
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

    const handleDeleteCategory = (id: string) => {
        const category = categories.find((cat) => cat.id === id);
        if (category) {
            setCategoryToDelete(category);
            setIsDeleteModalOpen(true);
        }
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

    if (loading) {
        return (
            <Card
                sx={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, color: "#64748b" }}>
                        กำลังโหลดข้อมูล...
                    </Typography>
                </Box>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                sx={{
                    mb: 3,
                    borderRadius: "16px",
                }}
                action={
                    <Button color="inherit" size="small" onClick={onRefresh}>
                        ลองใหม่
                    </Button>
                }
            >
                เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
            </Alert>
        );
    }

    return (
        <>
            <Card
                sx={{
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {/* Table Header */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Tags size={24} color="#8b5cf6" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                รายการหมวดหมู่ ({filteredCategories.length})
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <TextField
                                placeholder="ค้นหาหมวดหมู่..."
                                size="small"
                                value={searchTerm}
                                onChange={handleSearch}
                                sx={{
                                    width: { xs: "100%", sm: "250px" },
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} color="#64748b" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Tooltip
                                title="สร้างหมวดหมู่ใหม่สำหรับการจัดกลุ่มตัวชี้วัด"
                                arrow
                                placement="top"
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            backgroundColor: "#1e293b",
                                            color: "white",
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.15)",
                                            fontSize: "0.875rem",
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: "#1e293b",
                                        },
                                    },
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
                                        "&:hover": {
                                            backgroundColor: "#7c3aed",
                                        },
                                    }}
                                >
                                    เพิ่มหมวดหมู่
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Table Content */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        ชื่อหมวดหมู่
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        รายละเอียด
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        จำนวนตัวชี้วัด
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        วันที่สร้าง
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        จัดการ
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            sx={{ textAlign: "center", py: 4 }}
                                        >
                                            <Typography color="#64748b">
                                                {searchTerm
                                                    ? "ไม่พบหมวดหมู่ที่ค้นหา"
                                                    : "ไม่มีข้อมูลหมวดหมู่"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCategories.map(
                                        (category, index) => {
                                            const actualIndex =
                                                page * rowsPerPage + index;
                                            return (
                                                <TableRow
                                                    key={category.id}
                                                    onClick={() =>
                                                        handleRowClick(
                                                            category.id
                                                        )
                                                    }
                                                    sx={{
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#f8fafc",
                                                            cursor: "pointer",
                                                        },
                                                        borderBottom:
                                                            "1px solid #f1f5f9",
                                                        transition:
                                                            "background-color 0.2s ease",
                                                    }}
                                                >
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    borderRadius:
                                                                        "50%",
                                                                    backgroundColor:
                                                                        "#8b5cf6",
                                                                    color: "white",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                {actualIndex +
                                                                    1}
                                                            </Box>
                                                            <Typography
                                                                sx={{
                                                                    fontWeight:
                                                                        "600",
                                                                    color: "#1e293b",
                                                                }}
                                                            >
                                                                {category.name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                color: "#64748b",
                                                                fontSize:
                                                                    "0.875rem",
                                                            }}
                                                        >
                                                            {
                                                                category.description
                                                            }
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Chip
                                                            label={`${
                                                                category
                                                                    .indicators
                                                                    ?.length ||
                                                                0
                                                            } ตัวชี้วัด`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor:
                                                                    "#f1f5f9",
                                                                color: "#475569",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                color: "#64748b",
                                                                fontSize:
                                                                    "0.875rem",
                                                            }}
                                                        >
                                                            {"-"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                gap: 1,
                                                                justifyContent:
                                                                    "center",
                                                            }}
                                                        >
                                                            <Tooltip
                                                                title="แก้ไขข้อมูลหมวดหมู่"
                                                                arrow
                                                                placement="top"
                                                                componentsProps={{
                                                                    tooltip: {
                                                                        sx: {
                                                                            backgroundColor:
                                                                                "#1e293b",
                                                                            color: "white",
                                                                            borderRadius:
                                                                                "8px",
                                                                            boxShadow:
                                                                                "0 4px 12px rgba(0,0,0,0.15)",
                                                                            fontSize:
                                                                                "0.875rem",
                                                                        },
                                                                    },
                                                                    arrow: {
                                                                        sx: {
                                                                            color: "#1e293b",
                                                                        },
                                                                    },
                                                                }}
                                                            >
                                                                <IconButton
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleEditCategory(
                                                                            category.id
                                                                        );
                                                                    }}
                                                                    size="small"
                                                                    sx={{
                                                                        color: "#64748b",
                                                                        "&:hover":
                                                                            {
                                                                                color: "#8b5cf6",
                                                                                backgroundColor:
                                                                                    "#f1f5f9",
                                                                            },
                                                                    }}
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip
                                                                title="ลบหมวดหมู่นี้ออกจากระบบ"
                                                                arrow
                                                                placement="top"
                                                                componentsProps={{
                                                                    tooltip: {
                                                                        sx: {
                                                                            backgroundColor:
                                                                                "#1e293b",
                                                                            color: "white",
                                                                            borderRadius:
                                                                                "8px",
                                                                            boxShadow:
                                                                                "0 4px 12px rgba(0,0,0,0.15)",
                                                                            fontSize:
                                                                                "0.875rem",
                                                                        },
                                                                    },
                                                                    arrow: {
                                                                        sx: {
                                                                            color: "#1e293b",
                                                                        },
                                                                    },
                                                                }}
                                                            >
                                                                <IconButton
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteCategory(
                                                                            category.id
                                                                        );
                                                                    }}
                                                                    size="small"
                                                                    sx={{
                                                                        color: "#64748b",
                                                                        "&:hover":
                                                                            {
                                                                                color: "#ef4444",
                                                                                backgroundColor:
                                                                                    "#fef2f2",
                                                                            },
                                                                    }}
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filteredCategories.length > 0 && (
                        <TablePagination
                            component="div"
                            count={filteredCategories.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="แถวต่อหน้า:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} จาก ${
                                    count !== -1 ? count : `มากกว่า ${to}`
                                }`
                            }
                            sx={{
                                borderTop: "1px solid #f1f5f9",
                                "& .MuiTablePagination-toolbar": {
                                    px: 3,
                                    py: 2,
                                },
                                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                                    {
                                        color: "#64748b",
                                        fontSize: "0.875rem",
                                    },
                                "& .MuiIconButton-root": {
                                    color: "#64748b",
                                    "&:hover": {
                                        backgroundColor: "#f8fafc",
                                    },
                                    "&.Mui-disabled": {
                                        color: "#cbd5e1",
                                    },
                                },
                                "& .MuiSelect-select": {
                                    color: "#64748b",
                                    fontSize: "0.875rem",
                                },
                            }}
                        />
                    )}
                </CardContent>
            </Card>

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
                            sx={{
                                fontWeight: "600",
                                color: "#991b1b",
                                mb: 1,
                            }}
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
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alertSeverity}
                    sx={{
                        width: { xs: "60%", sm: "100%" },
                        minWidth: 200,
                        mx: "auto",
                    }}
                    variant="filled"
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
