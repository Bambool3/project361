"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Role, RoleFormData } from "@/types/role";
import { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Crown, Edit, Plus, Search, Trash2 } from "lucide-react";
import { Box } from "@mui/material";
import RoleAddEdit from "./RoleAdd&Edit";

interface RoleTableSectionProps {
    roles: Role[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function RoleTableSection({
    roles,
    loading,
    error,
    onRefresh,
}: RoleTableSectionProps) {
    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Pagination
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    // Alert states
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<
        "success" | "error" | "warning" | "info"
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

    // Filter roles based on search term
    const filteredRoles = useMemo(() => {
        return roles.filter((role) => {
            const matchesSearch = role.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [roles, searchTerm]);

    // Paginated data
    const paginatedRoles = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredRoles.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRoles, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // const handleAddRole = () => {
    //     setIsAddModalOpen(true);
    // };

    // const handleAddRoleSubmit = async (formData: RoleFormData) => {
    //     try {
    //         const response = await fetch("/api/role", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(formData),
    //         });

    //         if (response.status === 201) {
    //             setIsAddModalOpen(false);
    //             showAlert("เพิ่มตำแหน่งสำเร็จ!", "success");
    //             if (onRefresh) {
    //                 onRefresh();
    //             }
    //         } else if (response.status === 400) {
    //             showAlert(
    //                 "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
    //                 "error"
    //             );
    //         } else if (response.status === 409) {
    //             showAlert("ตำแหน่งนี้มีอยู่ในระบบแล้ว", "warning");
    //         } else if (response.status === 500) {
    //             showAlert("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", "error");
    //         } else {
    //             showAlert("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
    //         }
    //     } catch (error) {
    //         console.error("Error adding role:", error);
    //         showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    //     }
    // };

    const handleEditRole = (roleId: string) => {
        const role = roles.find((j) => j.id === roleId);
        if (role) {
            setSelectedRole(role);
            setIsEditModalOpen(true);
        }
    };

    const handleEditRoleSubmit = async (formData: RoleFormData) => {
        if (!selectedRole) return;

        try {
            const response = await fetch(`/api/role/${selectedRole.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 200) {
                setIsEditModalOpen(false);
                setSelectedRole(null);
                showAlert("แก้ไขตำแหน่งสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบตำแหน่งที่ต้องการแก้ไข", "error");
            } else if (response.status === 409) {
                showAlert("ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว", "warning");
            } else {
                showAlert("เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง", "error");
            }
        } catch (error) {
            console.error("Error editing role:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    // const handleDeleteRole = (roleId: string) => {
    //     const role = roles.find((j) => j.id === roleId);
    //     if (role) {
    //         setRoleToDelete(role);
    //         setIsDeleteModalOpen(true);
    //     }
    // };

    // const handleConfirmDelete = async () => {
    //     if (!roleToDelete) return;

    //     try {
    //         const response = await fetch(`/api/role/${roleToDelete.id}`, {
    //             method: "DELETE",
    //         });

    //         setIsDeleteModalOpen(false);
    //         setRoleToDelete(null);

    //         if (response.status === 200) {
    //             showAlert("ลบหตำแหน่งสำเร็จ!", "success");
    //             if (onRefresh) {
    //                 onRefresh();
    //             }
    //         } else if (response.status === 400) {
    //             const data = await response.json();
    //             showAlert(
    //                 data.error ||
    //                     "ไม่สามารถลบหตำแหน่งที่มีบุคลากรที่เกี่ยวข้องได้",
    //                 "warning"
    //             );
    //         } else if (response.status === 404) {
    //             showAlert("ไม่พบหตำแหน่งที่ต้องการลบ", "error");
    //         } else {
    //             showAlert("เกิดข้อผิดพลาดในการลบหตำแหน่ง", "error");
    //         }
    //     } catch (error) {
    //         console.error("Error deleting role:", error);
    //         showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    //     }
    // };

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
                {error}
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
                            <Crown size={24} color="#3b82f6" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                ตำแหน่งทั้งหมด ({filteredRoles.length})
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            {/* Search Bar */}
                            <TextField
                                placeholder="ค้นหาตำแหน่ง..."
                                value={searchTerm}
                                onChange={handleSearch}
                                size="small"
                                sx={{
                                    width: { xs: "100%", sm: "200px" },
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

                            {/* Add Role Button */}
                            {/*<Tooltip
                                title="เพิ่มตำแหน่งใหม่"
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
                                    onClick={handleAddRole}
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
                                    เพิ่มตำแหน่ง
                                </Button>
                            </Tooltip>*/}
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
                                        ลำดับ
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        ชื่อตำแหน่ง
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
                                        จำนวนบุคลากร
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
                                {paginatedRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            sx={{ textAlign: "center", py: 4 }}
                                        >
                                            <Typography color="#64748b">
                                                {searchTerm
                                                    ? "ไม่พบตำแหน่งที่ค้นหา"
                                                    : "ไม่มีข้อมูลตำแหน่ง"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRoles.map((role, index) => {
                                        const orderNumber =
                                            page * rowsPerPage + index + 1;
                                        return (
                                            <TableRow
                                                key={role.id}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#f8fafc",
                                                    },
                                                    borderBottom:
                                                        "1px solid #f1f5f9",
                                                }}
                                            >
                                                {/* Order Number Column */}
                                                <TableCell
                                                    sx={{
                                                        border: "none",
                                                        py: 2.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: "600",
                                                            color: "#374151",
                                                        }}
                                                    >
                                                        {orderNumber}
                                                    </Typography>
                                                </TableCell>

                                                {/* Name Column */}
                                                <TableCell
                                                    sx={{
                                                        border: "none",
                                                        py: 2.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#374151",
                                                        }}
                                                    >
                                                        {role.name}
                                                    </Typography>
                                                </TableCell>

                                                {/* Employee Count Column */}

                                                <TableCell
                                                    sx={{
                                                        border: "none",
                                                        py: 2.5,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#374151",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {role.employeeCount ||
                                                            0}{" "}
                                                        คน
                                                    </Typography>
                                                </TableCell>

                                                {/* Manage Column */}
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
                                                            title="แก้ไขข้อมูลตำแหน่ง"
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
                                                                onClick={() =>
                                                                    handleEditRole(
                                                                        role.id
                                                                    )
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    color: "#64748b",
                                                                    "&:hover": {
                                                                        color: "#8b5cf6",
                                                                        backgroundColor:
                                                                            "#f1f5f9",
                                                                    },
                                                                }}
                                                            >
                                                                <Edit
                                                                    size={16}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* <Tooltip
                                                            title="ลบตำแหน่งออกจากระบบ"
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
                                                                onClick={() =>
                                                                    handleDeleteRole(
                                                                        role.id
                                                                    )
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    color: "#64748b",
                                                                    "&:hover": {
                                                                        color: "#ef4444",
                                                                        backgroundColor:
                                                                            "#fef2f2",
                                                                    },
                                                                }}
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </IconButton>
                                                        </Tooltip> */}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filteredRoles.length > 0 && (
                        <Box
                            sx={{
                                borderTop: "1px solid #f1f5f9",
                                px: 2,
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={filteredRoles.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                labelRowsPerPage="แสดงต่อหน้า:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} จาก ${
                                        count !== -1 ? count : `มากกว่า ${to}`
                                    }`
                                }
                                sx={{
                                    "& .MuiTablePagination-select": {
                                        borderRadius: "8px",
                                    },
                                    "& .MuiTablePagination-actions": {
                                        "& .MuiIconButton-root": {
                                            borderRadius: "8px",
                                            "&:hover": {
                                                backgroundColor: "#f1f5f9",
                                            },
                                        },
                                    },
                                }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Add Role Modal */}
            {/* <CustomModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="เพิ่มตำแหน่งใหม่"
                maxWidth="sm"
                showActions={false}
            >
                <RoleAddEdit
                    onSubmit={handleAddRoleSubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </CustomModal> */}

            {/* Edit Role Modal */}
            <CustomModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedRole(null);
                }}
                title="แก้ไขข้อมูลตำแหน่ง"
                maxWidth="sm"
                showActions={false}
            >
                <RoleAddEdit
                    role={selectedRole}
                    onSubmit={handleEditRoleSubmit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedRole(null);
                    }}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            {/* <ConfirmModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setRoleToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบตำแหน่ง"
                message={`คุณแน่ใจหรือไม่ที่จะลบตำแหน่ง "${roleToDelete?.name}" ออกจากระบบ?`}
                confirmText="ลบ"
                cancelText="ยกเลิก"
                severity="error"
            /> */}

            {/* Alert Snackbar */}
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
