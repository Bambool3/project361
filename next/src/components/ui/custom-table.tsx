"use client";

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
    InputAdornment,
    Alert,
    CircularProgress,
    TablePagination,
} from "@mui/material";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface TableColumn<T> {
    id: string;
    label: string;
    align?: "left" | "center" | "right";
    render?: (item: T, index: number) => React.ReactNode;
    searchable?: boolean;
}

interface CustomTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: string | null;
    title: string;
    icon?: React.ReactNode;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    onRefresh?: () => void;
    emptyMessage?: string;
    searchableFields?: (keyof T)[];
    headerAction?: React.ReactNode;
}

export default function CustomTable<T extends { id: string }>({
    data,
    columns,
    loading = false,
    error = null,
    title,
    icon,
    searchPlaceholder = "ค้นหา...",
    onRowClick,
    onRefresh,
    emptyMessage = "ไม่มีข้อมูล",
    searchableFields = [],
    headerAction,
}: CustomTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        return data.filter((item) => {
            if (searchableFields.length > 0) {
                return searchableFields.some((field) => {
                    const value = item[field];
                    return String(value)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                });
            }

            const searchableColumns = columns.filter(
                (col) => col.searchable !== false
            );
            return searchableColumns.some((column) => {
                const value = (item as any)[column.id];
                return String(value)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, searchableFields, columns]);

    const paginatedData = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

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
                sx={{ mb: 3, borderRadius: "16px" }}
                action={
                    onRefresh && (
                        <Button
                            color="inherit"
                            size="small"
                            onClick={onRefresh}
                        >
                            ลองใหม่
                        </Button>
                    )
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
                {/* Header */}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {icon}
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#1e293b" }}
                        >
                            {title} ({filteredData.length})
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <TextField
                            placeholder={searchPlaceholder}
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
                        {headerAction}
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: column.align || "left",
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        sx={{ textAlign: "center", py: 4 }}
                                    >
                                        <Typography color="#64748b">
                                            {searchTerm
                                                ? "ไม่พบข้อมูลที่ค้นหา"
                                                : emptyMessage}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const actualIndex =
                                        page * rowsPerPage + index;
                                    return (
                                        <TableRow
                                            key={item.id}
                                            onClick={() => onRowClick?.(item)}
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "#f8fafc",
                                                    cursor: onRowClick
                                                        ? "pointer"
                                                        : "default",
                                                },
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                                transition:
                                                    "background-color 0.2s ease",
                                            }}
                                        >
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    sx={{
                                                        border: "none",
                                                        py: 2.5,
                                                        textAlign:
                                                            column.align ||
                                                            "left",
                                                    }}
                                                >
                                                    {column.render
                                                        ? column.render(
                                                              item,
                                                              actualIndex
                                                          )
                                                        : String(
                                                              (item as any)[
                                                                  column.id
                                                              ] || ""
                                                          )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <TablePagination
                        component="div"
                        count={filteredData.length}
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
                            "& .MuiTablePagination-toolbar": { px: 3, py: 2 },
                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                                {
                                    color: "#64748b",
                                    fontSize: "0.875rem",
                                },
                            "& .MuiIconButton-root": {
                                color: "#64748b",
                                "&:hover": { backgroundColor: "#f8fafc" },
                                "&.Mui-disabled": { color: "#cbd5e1" },
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
