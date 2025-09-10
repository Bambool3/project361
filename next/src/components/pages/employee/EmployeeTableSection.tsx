"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Employee, JobTitle, EmployeeFormData, Role } from "@/types/employee";

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
    Chip,
    Alert,
    CircularProgress,
    TablePagination,
    Snackbar,
    Tooltip,
    Avatar,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {
    Edit,
    Trash2,
    User,
    Search,
    Plus,
    Download,
    Upload,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import EmployeeAddEdit from "./EmployeeAdd&Edit";
import { EmployeeService } from "@/server/services/employee/employee-client-service";

interface EmployeeTableSectionProps {
    employees: Employee[];
    jobTitles: JobTitle[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function EmployeeTableSection({
    employees,
    jobTitles,
    loading,
    error,
    onRefresh,
}: EmployeeTableSectionProps) {
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");

    // Data states for form
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true);

    // Pagination
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
        null
    );

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

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoadingRoles(true);
                const rolesData = await EmployeeService.getRoles();
                setRoles(rolesData);
            } catch (error) {
                console.error("Error fetching roles:", error);
                showAlert("ไม่สามารถโหลดข้อมูลตำแหน่งได้", "error");
            } finally {
                setLoadingRoles(false);
            }
        };

        fetchRoles();
    }, []);

    const handleCloseAlert = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setAlertOpen(false);
    };

    // Filter employees based on search term and department
    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            const matchesSearch =
                employee.first_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                employee.last_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesJobTitle =
                !selectedDepartment ||
                employee.job_titles.some((jt) => jt.id === selectedDepartment);

            return matchesSearch && matchesJobTitle;
        });
    }, [employees, searchTerm, selectedDepartment]);

    // Paginated data
    const paginatedEmployees = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredEmployees, page, rowsPerPage]);

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

    const handleDepartmentChange = (event: any) => {
        setSelectedDepartment(event.target.value);
        setPage(0);
    };

    const handleAddEmployee = () => {
        setIsAddModalOpen(true);
    };

    const handleAddEmployeeSubmit = async (formData: EmployeeFormData) => {
        try {
            const statusCode = await EmployeeService.createEmployeeWithStatus(
                formData
            );

            if (statusCode === 201) {
                setIsAddModalOpen(false);
                showAlert("เพิ่มบุคลากรสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (statusCode === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (statusCode === 409) {
                showAlert("บุคลากรคนนี้มีอยู่ในระบบแล้ว", "warning");
            } else if (statusCode === 500) {
                showAlert(
                    "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
                    "error"
                );
            } else {
                showAlert("เกิดข้อผิดพลาดในการเพิ่มบุคลากร", "error");
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleEditEmployee = (employeeId: string) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
            setSelectedEmployee(employee);
            setIsEditModalOpen(true);
        }
    };

    const handleEditEmployeeSubmit = async (formData: EmployeeFormData) => {
        if (!selectedEmployee) return;

        try {
            const statusCode = await EmployeeService.updateEmployeeWithStatus(
                selectedEmployee.id,
                formData
            );

            if (statusCode === 200) {
                setIsEditModalOpen(false);
                setSelectedEmployee(null);
                showAlert("แก้ไขข้อมูลบุคลากรสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (statusCode === 400) {
                showAlert(
                    "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
                    "error"
                );
            } else if (statusCode === 404) {
                showAlert("ไม่พบบุคลากรที่ต้องการแก้ไข", "error");
            } else if (statusCode === 409) {
                showAlert(
                    "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเปลี่ยนอีเมล",
                    "warning"
                );
            } else if (statusCode === 500) {
                showAlert(
                    "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง",
                    "error"
                );
            } else {
                showAlert("เกิดข้อผิดพลาดในการแก้ไขบุคลากร", "error");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const handleExportExcel = () => {
        // TODO
        showAlert("ฟีเจอร์ส่งออก Excel จะพัฒนาในอนาคต", "info");
    };

    const handleImportExcel = () => {
        // TODO
        showAlert("ฟีเจอร์นำเข้า Excel จะพัฒนาในอนาคต", "info");
    };

    const handleDeleteEmployee = (employeeId: string) => {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (employee) {
            setEmployeeToDelete(employee);
            setIsDeleteModalOpen(true);
        }
    };

    const handleDeleteEmployeeConfirm = async () => {
        if (!employeeToDelete) return;

        try {
            const response = await fetch(
                `/api/employee/${employeeToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setIsDeleteModalOpen(false);
                setEmployeeToDelete(null);
                showAlert("ลบบุคลากรสำเร็จ!", "success");
                if (onRefresh) {
                    onRefresh();
                }
            } else if (response.status === 400) {
                const data = await response.json();
                showAlert(
                    data.error ||
                        "ไม่สามารถลบบุคลากรที่มีตัวชี้วัดที่เกี่ยวข้องได้",
                    "warning"
                );
            } else if (response.status === 404) {
                showAlert("ไม่พบบุคลากรที่ต้องการลบ", "error");
            } else {
                showAlert("เกิดข้อผิดพลาดในการลบบุคลากร", "error");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
                            <User size={24} color="#3b82f6" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                รายการบุคลากร ({filteredEmployees.length})
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
                                placeholder="ค้นหาบุคลากร..."
                                size="small"
                                value={searchTerm}
                                onChange={handleSearch}
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

                            {/* Department Dropdown */}
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel id="department-select-label">
                                    หน่วยงาน
                                </InputLabel>
                                <Select
                                    labelId="department-select-label"
                                    value={selectedDepartment}
                                    label="หน่วยงาน"
                                    onChange={handleDepartmentChange}
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
                                    {jobTitles.map((jobTitle) => (
                                        <MenuItem
                                            key={jobTitle.id}
                                            value={jobTitle.id}
                                        >
                                            {jobTitle.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Action Buttons */}
                            <Tooltip
                                title="ส่งออกข้อมูล Excel"
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
                                    onClick={handleExportExcel}
                                    startIcon={<Upload size={18} />}
                                    sx={{
                                        backgroundColor: "#f59e0b",
                                        color: "white",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        py: 1,
                                        borderRadius: "12px",
                                        "&:hover": {
                                            backgroundColor: "#d97706",
                                        },
                                    }}
                                >
                                    ส่งออก
                                </Button>
                            </Tooltip>

                            <Tooltip
                                title="นำเข้าข้อมูล Excel"
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
                                    onClick={handleImportExcel}
                                    startIcon={<Download size={18} />}
                                    sx={{
                                        backgroundColor: "#10b981",

                                        color: "white",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        py: 1,
                                        borderRadius: "12px",
                                        "&:hover": {
                                            backgroundColor: "#059669",
                                        },
                                    }}
                                >
                                    นำเข้า
                                </Button>
                            </Tooltip>

                            <Tooltip
                                title="เพิ่มบุคลากรใหม่"
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
                                    onClick={handleAddEmployee}
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
                                    เพิ่มบุคลากร
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
                                        ชื่อ-นามสกุล
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        อีเมล
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
                                        หน่วยงาน
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
                                        ตำแหน่ง
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
                                {paginatedEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            sx={{ textAlign: "center", py: 4 }}
                                        >
                                            <Typography color="#64748b">
                                                {searchTerm ||
                                                selectedDepartment
                                                    ? "ไม่พบบุคลากรที่ค้นหา"
                                                    : "ไม่มีข้อมูลบุคลากร"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedEmployees.map(
                                        (employee, index) => {
                                            const actualIndex =
                                                page * rowsPerPage + index;
                                            return (
                                                <TableRow
                                                    key={employee.id}
                                                    sx={{
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#f8fafc",
                                                        },
                                                        borderBottom:
                                                            "1px solid #f1f5f9",
                                                    }}
                                                >
                                                    {/* Name Column */}
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
                                                            <Avatar
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    backgroundColor:
                                                                        "#8b5cf6",
                                                                    color: "white",
                                                                    fontSize:
                                                                        "0.875rem",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    employee.first_name,
                                                                    employee.last_name
                                                                )}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight:
                                                                            "600",
                                                                        color: "#1e293b",
                                                                    }}
                                                                >
                                                                    {
                                                                        employee.first_name
                                                                    }{" "}
                                                                    {
                                                                        employee.last_name
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        color: "#64748b",
                                                                    }}
                                                                >
                                                                    ID:{" "}
                                                                    {actualIndex +
                                                                        1}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Email Column */}
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
                                                            {employee.email}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Job Title Column */}
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {employee.job_titles
                                                            .length > 0 ? (
                                                            employee.job_titles.map(
                                                                (
                                                                    jobTitle,
                                                                    index
                                                                ) => (
                                                                    <Chip
                                                                        key={
                                                                            jobTitle.id
                                                                        }
                                                                        label={
                                                                            jobTitle.name
                                                                        }
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor:
                                                                                "#f1f5f9",
                                                                            color: "#475569",
                                                                            fontWeight:
                                                                                "600",
                                                                            margin: "2px",
                                                                        }}
                                                                    />
                                                                )
                                                            )
                                                        ) : (
                                                            <Chip
                                                                label="ไม่ได้ระบุตำแหน่ง"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor:
                                                                        "#fee2e2",
                                                                    color: "#dc2626",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>

                                                    {/* Role Column */}
                                                    <TableCell
                                                        sx={{
                                                            border: "none",
                                                            py: 2.5,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {employee.roles.length >
                                                        0 ? (
                                                            employee.roles.map(
                                                                (
                                                                    role,
                                                                    index
                                                                ) => (
                                                                    <Chip
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        label={
                                                                            role.name
                                                                        }
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor:
                                                                                "#f1f5f9",
                                                                            color: "#475569",
                                                                            fontWeight:
                                                                                "600",
                                                                            margin: "2px",
                                                                        }}
                                                                    />
                                                                )
                                                            )
                                                        ) : (
                                                            <Chip
                                                                label="ไม่ได้ระบุบทบาท"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor:
                                                                        "#fee2e2",
                                                                    color: "#dc2626",
                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            />
                                                        )}
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
                                                                title="แก้ไขข้อมูลบุคลากร"
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
                                                                        handleEditEmployee(
                                                                            employee.id
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
                                                                title="ลบบุคลากรออกจากระบบ"
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
                                                                        handleDeleteEmployee(
                                                                            employee.id
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
                    {filteredEmployees.length > 0 && (
                        <Box
                            sx={{
                                borderTop: "1px solid #f1f5f9",
                                px: 2,
                            }}
                        >
                            <TablePagination
                                component="div"
                                count={filteredEmployees.length}
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

            {/* Add Employee Modal */}
            <CustomModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="เพิ่มบุคลากรใหม่"
                maxWidth="md"
                showActions={false}
            >
                <EmployeeAddEdit
                    jobTitles={jobTitles}
                    roles={roles}
                    onSubmit={handleAddEmployeeSubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                    loading={loadingRoles}
                />
            </CustomModal>

            {/* Edit Employee Modal */}
            <CustomModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployee(null);
                }}
                title="แก้ไขข้อมูลบุคลากร"
                maxWidth="md"
                showActions={false}
            >
                {selectedEmployee && (
                    <EmployeeAddEdit
                        initialData={selectedEmployee}
                        jobTitles={jobTitles}
                        roles={roles}
                        onSubmit={handleEditEmployeeSubmit}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedEmployee(null);
                        }}
                        loading={loadingRoles}
                    />
                )}
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEmployeeToDelete(null);
                }}
                onConfirm={handleDeleteEmployeeConfirm}
                title="ยืนยันการลบบุคลากร"
                message={
                    employeeToDelete
                        ? `คุณแน่ใจหรือไม่ที่จะลบบุคลากร "${employeeToDelete.first_name} ${employeeToDelete.last_name}" ออกจากระบบ?`
                        : ""
                }
                confirmText="ลบ"
                cancelText="ยกเลิก"
            />

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
