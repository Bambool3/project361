"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Frequency, FrequencyFormData } from "@/types/frequency";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Calendar, Edit, Plus, Search, Trash2 } from "lucide-react";
import { Box } from "@mui/material";
import FrequencyAddEdit from "./FrequencyAdd&Edit";

interface FrequencyTableSectionProps {
    frequencies: Frequency[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function FrequencyTableSection({
    frequencies,
    loading,
    error,
    onRefresh,
}: FrequencyTableSectionProps) {
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    // Pagination
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFrequency, setSelectedFrequency] =
        useState<Frequency | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [frequencyToDelete, setFrequencyToDelete] =
        useState<Frequency | null>(null);

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

    // Filter frequencies based on search term and type
    const filteredFrequencies = useMemo(() => {
        return frequencies.filter((frequency) => {
            const matchesSearch = frequency.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesType =
                !selectedType || frequency.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [frequencies, searchTerm, selectedType]);

    // Paginated data
    const paginatedFrequencies = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredFrequencies.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredFrequencies, page, rowsPerPage]);

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

    const handleTypeChange = (event: any) => {
        setSelectedType(event.target.value);
        setPage(0);
    };

    const handleAddFrequency = () => {
        setIsAddModalOpen(true);
    };

    const handleAddFrequencySubmit = async (formData: FrequencyFormData) => {
        try {
            const response = await fetch("/api/frequency", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 201) {
                setIsAddModalOpen(false);
                showAlert("เพิ่มความถี่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (response.status === 409) {
                showAlert("ความถี่นี้มีอยู่ในระบบแล้ว", "warning");
            } else {
                showAlert("เกิดข้อผิดพลาดในการเพิ่มความถี่", "error");
            }
        } catch (error) {
            console.error("Error adding frequency:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleEditFrequency = (frequencyId: string) => {
        const frequency = frequencies.find((f) => f.id === frequencyId);
        if (frequency) {
            setSelectedFrequency(frequency);
            setIsEditModalOpen(true);
        }
    };

    const handleEditFrequencySubmit = async (formData: FrequencyFormData) => {
        if (!selectedFrequency) return;

        try {
            const response = await fetch(
                `/api/frequency/${selectedFrequency.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.status === 200) {
                setIsEditModalOpen(false);
                setSelectedFrequency(null);
                showAlert("แก้ไขความถี่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบความถี่ที่ต้องการแก้ไข", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดในการแก้ไขความถี่", "error");
            }
        } catch (error) {
            console.error("Error editing frequency:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleDeleteFrequency = (frequencyId: string) => {
        const frequency = frequencies.find((f) => f.id === frequencyId);
        if (frequency) {
            setFrequencyToDelete(frequency);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!frequencyToDelete) return;

        try {
            const response = await fetch(
                `/api/frequency/${frequencyToDelete.id}`,
                {
                    method: "DELETE",
                }
            );

            setIsDeleteModalOpen(false);
            setFrequencyToDelete(null);

            if (response.status === 200) {
                showAlert("ลบความถี่สำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                const data = await response.json();
                showAlert(
                    data.error ||
                        "ไม่สามารถลบความถี่ที่มีตัวชี้วัดที่เกี่ยวข้องได้",
                    "warning"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบความถี่ที่ต้องการลบ", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดในการลบความถี่", "error");
            }
        } catch (error) {
            console.error("Error deleting frequency:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const formatDateRange = (periods: any[]) => {
        if (!periods || periods.length === 0) return "ไม่มีข้อมูล";
        if (periods.length === 1) {
            const period = periods[0];
            return `${new Date(period.startDate).toLocaleDateString(
                "th-TH"
            )} - ${new Date(period.endDate).toLocaleDateString("th-TH")}`;
        }
        return `${periods.length} ช่วงเวลา`;
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
                            <Calendar size={24} color="#3b82f6" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                รายการความถี่ ({filteredFrequencies.length})
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
                                placeholder="ค้นหาความถี่..."
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

                            {/* Type Filter */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel id="type-select-label">
                                    ประเภท
                                </InputLabel>
                                <Select
                                    labelId="type-select-label"
                                    value={selectedType}
                                    label="ประเภท"
                                    onChange={handleTypeChange}
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
                                >
                                    <MenuItem value="">ทั้งหมด</MenuItem>
                                    <MenuItem value="standard">
                                        มาตรฐาน
                                    </MenuItem>
                                    <MenuItem value="custom">กำหนดเอง</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Add Frequency Button */}
                            <Tooltip
                                title="เพิ่มความถี่ใหม่"
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
                                    onClick={handleAddFrequency}
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
                                    เพิ่มความถี่
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
                                        ชื่อความถี่
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
                                        ประเภท
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
                                        ช่วงเวลา
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
                                        จัดการ
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedFrequencies.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            sx={{ textAlign: "center", py: 4 }}
                                        >
                                            <Typography color="#64748b">
                                                {searchTerm || selectedType
                                                    ? "ไม่พบความถี่ที่ค้นหา"
                                                    : "ไม่มีข้อมูลความถี่"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedFrequencies.map(
                                        (frequency, index) => {
                                            const orderNumber =
                                                page * rowsPerPage + index + 1;
                                            return (
                                                <TableRow
                                                    key={frequency.id}
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
                                                                fontWeight:
                                                                    "600",
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
                                                            {frequency.name}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Type Column */}
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Chip
                                                            label={
                                                                frequency.type ===
                                                                "standard"
                                                                    ? "มาตรฐาน"
                                                                    : "กำหนดเอง"
                                                            }
                                                            size="small"
                                                            sx={{
                                                                backgroundColor:
                                                                    frequency.type ===
                                                                    "standard"
                                                                        ? "#dbeafe"
                                                                        : "#fef3c7",
                                                                color:
                                                                    frequency.type ===
                                                                    "standard"
                                                                        ? "#1e40af"
                                                                        : "#92400e",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Periods Column */}
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
                                                            }}
                                                        >
                                                            {formatDateRange(
                                                                frequency.periods
                                                            )}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Indicator Count Column */}
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
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            {frequency.indicatorCount ||
                                                                0}{" "}
                                                            ตัวชี้วัด
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
                                                                title="แก้ไขข้อมูลความถี่"
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
                                                                        handleEditFrequency(
                                                                            frequency.id
                                                                        )
                                                                    }
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
                                                                title="ลบความถี่ออกจากระบบ"
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
                                                                        handleDeleteFrequency(
                                                                            frequency.id
                                                                        )
                                                                    }
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
                    {filteredFrequencies.length > 0 && (
                        <Box
                            sx={{
                                borderTop: "1px solid #f1f5f9",
                                px: 2,
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={filteredFrequencies.length}
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

            {/* Add Frequency Modal */}
            <CustomModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="เพิ่มความถี่ใหม่"
                maxWidth="md"
                showActions={false}
            >
                <FrequencyAddEdit
                    onSubmit={handleAddFrequencySubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </CustomModal>

            {/* Edit Frequency Modal */}
            <CustomModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedFrequency(null);
                }}
                title="แก้ไขข้อมูลความถี่"
                maxWidth="md"
                showActions={false}
            >
                <FrequencyAddEdit
                    frequency={selectedFrequency}
                    onSubmit={handleEditFrequencySubmit}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedFrequency(null);
                    }}
                />
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setFrequencyToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบความถี่"
                message={`คุณแน่ใจหรือไม่ที่จะลบความถี่ "${frequencyToDelete?.name}" ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
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
