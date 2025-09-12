"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Job, JobFormData } from "@/types/job";

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
    IconButton,
    Alert,
    CircularProgress,
    TablePagination,
    Snackbar,
    Tooltip,
    Button,
    TextField,
    InputAdornment,
    Chip,
} from "@mui/material";
import { Edit, Trash2, Search, Plus, Building2 } from "lucide-react";
import { useState, useMemo } from "react";
import JobAddEdit from "./JobAdd&Edit";

interface JobTableSectionProps {
    jobs: Job[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function JobTableSection({
    jobs,
    loading,
    error,
    onRefresh,
}: JobTableSectionProps) {
    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Pagination
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

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

    // Filter jobs based on search term
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch = job.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [jobs, searchTerm]);

    // Paginated data
    const paginatedJobs = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredJobs.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredJobs, page, rowsPerPage]);

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

    const handleAddJob = () => {
        setIsAddModalOpen(true);
    };

    const handleAddJobSubmit = async (formData: JobFormData) => {
        try {
            const response = await fetch("/api/jobTitle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 201) {
                setIsAddModalOpen(false);
                showAlert("เพิ่มหน่วยงานสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (response.status === 409) {
                showAlert("หน่วยงานนี้มีอยู่ในระบบแล้ว", "warning");
            } else if (response.status === 500) {
                showAlert("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
            }
        } catch (error) {
            console.error("Error adding job:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleEditJob = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            setSelectedJob(job);
            setIsEditModalOpen(true);
        }
    };

    const handleEditJobSubmit = async (formData: JobFormData) => {
        if (!selectedJob) return;

        try {
            const response = await fetch(`/api/jobTitle/${selectedJob.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 200) {
                setIsEditModalOpen(false);
                setSelectedJob(null);
                showAlert("แก้ไขหน่วยงานสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบหน่วยงานที่ต้องการแก้ไข", "error");
            } else if (response.status === 409) {
                showAlert("ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว", "warning");
            } else {
                showAlert("เกิดข้อผิดพลาดในการแก้ไขหน่วยงาน", "error");
            }
        } catch (error) {
            console.error("Error editing job:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleDeleteJob = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            setJobToDelete(job);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!jobToDelete) return;

        try {
            const response = await fetch(`/api/jobTitle/${jobToDelete.id}`, {
                method: "DELETE",
            });

            setIsDeleteModalOpen(false);
            setJobToDelete(null);

            if (response.status === 200) {
                showAlert("ลบหน่วยงานสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                const data = await response.json();
                showAlert(
                    data.error ||
                        "ไม่สามารถลบหน่วยงานที่มีบุคลากรที่เกี่ยวข้องได้",
                    "warning"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบหน่วยงานที่ต้องการลบ", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดในการลบหน่วยงาน", "error");
            }
        } catch (error) {
            console.error("Error deleting job:", error);
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
                            <Building2 size={24} color="#3b82f6" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                หน่วยงานทั้งหมด ({filteredJobs.length})
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
                                placeholder="ค้นหาหน่วยงาน..."
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

                            {/* Add Job Button */}
                            <Tooltip
                                title="เพิ่มหน่วยงานใหม่"
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
                                    onClick={handleAddJob}
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
                                    เพิ่มหน่วยงาน
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
                                        ชื่อหน่วยงาน
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
                                {paginatedJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            sx={{ textAlign: "center", py: 4 }}
                                        >
                                            <Typography color="#64748b">
                                                {searchTerm
                                                    ? "ไม่พบหน่วยงานที่ค้นหา"
                                                    : "ไม่มีข้อมูลหน่วยงาน"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedJobs.map((job, index) => {
                                        const orderNumber =
                                            page * rowsPerPage + index + 1;
                                        return (
                                            <TableRow
                                                key={job.id}
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
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                                "#8b5cf6",
                                                            color: "white",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {orderNumber}
                                                    </Box>
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
                                                            fontWeight: "600",
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {job.name}
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
                                                    <Chip
                                                        label={`${
                                                            job.employeeCount ||
                                                            0
                                                        } คน`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor:
                                                                "#f1f5f9",
                                                            color: "#475569",
                                                            fontWeight: "600",
                                                        }}
                                                    />
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
                                                            title="แก้ไขข้อมูลหน่วยงาน"
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
                                                                    handleEditJob(
                                                                        job.id
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
                                                        <Tooltip
                                                            title="ลบหน่วยงานออกจากระบบ"
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
                                                                    handleDeleteJob(
                                                                        job.id
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
                                                        </Tooltip>
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
                    {filteredJobs.length > 0 && (
                        <Box
                            sx={{
                                borderTop: "1px solid #f1f5f9",
                                px: 2,
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={filteredJobs.length}
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

            {/* Add Job Modal */}
            <CustomModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="เพิ่มหน่วยงานใหม่"
                maxWidth="sm"
                showActions={false}
            >
                <JobAddEdit
                    onSubmit={handleAddJobSubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </CustomModal>

            {/* Edit Job Modal */}
            <CustomModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedJob(null);
                }}
                title="แก้ไขข้อมูลหน่วยงาน"
                maxWidth="sm"
                showActions={false}
            >
                <JobAddEdit
                    job={selectedJob}
                    onSubmit={handleEditJobSubmit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedJob(null);
                    }}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setJobToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบหน่วยงาน"
                message={`คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน "${jobToDelete?.name}" ออกจากระบบ?`}
                confirmText="ลบ"
                cancelText="ยกเลิก"
                severity="error"
            />

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
