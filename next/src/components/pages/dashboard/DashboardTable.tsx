"use client";

import { Category } from "@/types/dashboard";
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
} from "@mui/material";
import { Search, Plus, Edit, Trash2, Tags } from "lucide-react";
import { useState, useMemo } from "react";

interface DashboardTableProps {
    categories: Category[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function DashboardTable({
    categories,
    loading,
    error,
    onRefresh,
}: DashboardTableProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

    const handleAddTopic = () => {
        alert("เพิ่มหมวดหมู่ใหม่");
        // TODO:
    };

    const handleEdit = (id: string) => {
        alert(`แก้ไขหมวดหมู่ ID: ${id}`);
        // TODO:
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?")) {
            // TODO:
            alert(`ลบหมวดหมู่ ID: ${id}`);
            //
            if (onRefresh) {
                onRefresh();
            }
        }
    };

    // colors
    const categoryColors = [
        "#8b5cf6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#3b82f6",
        "#f97316",
        "#06b6d4",
        "#84cc16",
    ];

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
                        <Button
                            onClick={handleAddTopic}
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
                                    จำนวน KPIs
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
                                paginatedCategories.map((category, index) => {
                                    // Calculate the actual index for color consistency
                                    const actualIndex =
                                        page * rowsPerPage + index;
                                    return (
                                        <TableRow
                                            key={category.id}
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "#f8fafc",
                                                },
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            <TableCell
                                                sx={{ border: "none", py: 2.5 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                                categoryColors[
                                                                    actualIndex %
                                                                        categoryColors.length
                                                                ],
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "600",
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {category.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell
                                                sx={{ border: "none", py: 2.5 }}
                                            >
                                                <Typography
                                                    sx={{
                                                        color: "#64748b",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {category.description}
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
                                                        category.indicators
                                                            ?.length || 0
                                                    } KPIs`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor:
                                                            "#f1f5f9",
                                                        color: "#475569",
                                                        fontWeight: "600",
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
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <IconButton
                                                        onClick={() =>
                                                            handleEdit(
                                                                category.id
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
                                                        <Edit size={16} />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() =>
                                                            handleDelete(
                                                                category.id
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
                                                        <Trash2 size={16} />
                                                    </IconButton>
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
    );
}
