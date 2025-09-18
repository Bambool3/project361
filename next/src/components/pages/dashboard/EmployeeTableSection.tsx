"use client";

import { Category } from "@/types/category";
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
    Chip,
    InputAdornment,
    Alert,
    CircularProgress,
    TablePagination,
    Snackbar,
} from "@mui/material";
import { Search, Tags } from "lucide-react";
import { useState, useMemo } from "react";

interface EmployeeTableSectionProps {
    categories: Category[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

export default function EmployeeTableSection({
    categories,
    loading,
    error,
    onRefresh,
}: EmployeeTableSectionProps) {
    const router = useRouter();

    // Search
    const [searchTerm, setSearchTerm] = useState<string>("");
    // Pagination
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

    const handleRowClick = (categoryId: string) => {
        router.push(`/employee/management?categoryId=${categoryId}`);
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
                                รายการหมวดหมู่ที่ท่านรับผิดชอบ (
                                {filteredCategories.length})
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
                                                            {new Date(
                                                                category.created_at
                                                            ).toLocaleDateString(
                                                                "th-TH",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </Typography>
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
        </>
    );
}
