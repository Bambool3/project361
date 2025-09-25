"use client";

import ConfirmModal from "@/components/ui/confirm-modal";
import CustomModal from "@/components/ui/custom-modal";
import { useNotification } from "@/providers/NotificationProvider";
import { Unit, UnitFormData } from "@/types/unit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
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
import { Edit, Plus, Scale, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import UnitAddEdit from "./UnitAdd&Edit";

interface UnitTableSectionProps {
  units: Unit[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function UnitTableSection({
  units,
  loading,
  error,
  onRefresh,
}: UnitTableSectionProps) {
  const { showNotification } = useNotification();

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal states

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Filter units based on search term
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch = unit.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [units, searchTerm]);

  // Paginated data
  const paginatedUnits = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUnits.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUnits, page, rowsPerPage]);

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

  const handleAddUnit = () => {
    setIsAddModalOpen(true);
  };

  const handleAddUnitSubmit = async (formData: UnitFormData) => {
    try {
      const response = await fetch("/api/unit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        setIsAddModalOpen(false);
        showNotification("เพิ่มหน่วยสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 409) {
        showNotification("หน่วยนี้มีอยู่ในระบบแล้ว", "warning");
      } else if (response.status === 500) {
        showNotification("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
      }
    } catch (error) {
      console.error("Error adding unit:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleEditUnit = (unitId: string) => {
    const unit = units.find((j) => j.id === unitId);
    if (unit) {
      setSelectedUnit(unit);
      setIsEditModalOpen(true);
    }
  };

  const handleEditUnitSubmit = async (formData: UnitFormData) => {
    if (!selectedUnit) return;

    try {
      const response = await fetch(`/api/unit/${selectedUnit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedUnit(null);
        showNotification("แก้ไขหน่วยสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบหน่วยที่ต้องการแก้ไข", "error");
      } else if (response.status === 409) {
        showNotification("ชื่อหน่วยนี้มีอยู่ในระบบแล้ว", "warning");
      } else {
        showNotification("เกิดข้อผิดพลาดในการแก้ไขหน่วย", "error");
      }
    } catch (error) {
      console.error("Error editing unit:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    const unit = units.find((j) => j.id === unitId);
    if (unit) {
      setUnitToDelete(unit);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      const response = await fetch(`/api/unit/${unitToDelete.id}`, {
        method: "DELETE",
      });

      setIsDeleteModalOpen(false);
      setUnitToDelete(null);

      if (response.status === 200) {
        showNotification("ลบหหน่วยสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        const data = await response.json();
        showNotification(
          data.error || "ไม่สามารถลบหหน่วยที่มีบุคลากรที่เกี่ยวข้องได้",
          "warning"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบหหน่วยที่ต้องการลบ", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดในการลบหหน่วย", "error");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
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
              <Scale size={24} color="#3b82f6" />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                หน่วยทั้งหมด ({filteredUnits.length})
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
                placeholder="ค้นหาหน่วย..."
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

              {/* Add Unit Button */}
              <Tooltip
                title="เพิ่มหน่วยใหม่"
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
                  arrow: {
                    sx: {
                      color: "#1e293b",
                    },
                  },
                }}
              >
                <Button
                  onClick={handleAddUnit}
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
                  เพิ่มหน่วย
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Table Content */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  {/* <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#475569",
                      border: "none",
                      py: 2,
                    }}
                  >
                    ลำดับ
                  </TableCell> */}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#475569",
                      border: "none",
                      py: 2,
                    }}
                  >
                    ชื่อหน่วย
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
                {paginatedUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="#64748b">
                        {searchTerm ? "ไม่พบหน่วยที่ค้นหา" : "ไม่มีข้อมูลหน่วย"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUnits.map((unit, index) => {
                    const orderNumber = page * rowsPerPage + index + 1;
                    return (
                      <TableRow
                        key={unit.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f8fafc",
                          },
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {/* Order Number Column */}
                        {/* <TableCell
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
                        </TableCell> */}

                        {/* Name Column */}
                        <TableCell
                          sx={{
                            border: "none",
                            py: 2.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "600",
                              color: "#1e293b",
                            }}
                          >
                            {unit.name}
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
                              fontWeight: "500",
                            }}
                          >
                            {unit.indicatorCount || 0} ตัวชี้วัด
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
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip
                              title="แก้ไขข้อมูลหน่วย"
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
                                arrow: {
                                  sx: {
                                    color: "#1e293b",
                                  },
                                },
                              }}
                            >
                              <IconButton
                                onClick={() => handleEditUnit(unit.id)}
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
                              title="ลบหน่วยออกจากระบบ"
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
                                arrow: {
                                  sx: {
                                    color: "#1e293b",
                                  },
                                },
                              }}
                            >
                              <IconButton
                                onClick={() => handleDeleteUnit(unit.id)}
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
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredUnits.length > 0 && (
            <Box
              sx={{
                borderTop: "1px solid #f1f5f9",
                px: 2,
              }}
            >
              <TablePagination
                component="div"
                count={filteredUnits.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="แสดงต่อหน้า:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
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

      {/* Add Unit Modal */}
      <CustomModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มหน่วยใหม่"
        maxWidth="sm"
        showActions={false}
      >
        <UnitAddEdit
          onSubmit={handleAddUnitSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </CustomModal>

      {/* Edit Unit Modal */}
      <CustomModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUnit(null);
        }}
        title="แก้ไขข้อมูลหน่วย"
        maxWidth="sm"
        showActions={false}
      >
        <UnitAddEdit
          unit={selectedUnit}
          onSubmit={handleEditUnitSubmit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedUnit(null);
          }}
        />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUnitToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบหน่วย"
        message={`คุณแน่ใจหรือไม่ที่จะลบหน่วย "${unitToDelete?.name}" ออกจากระบบ?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        severity="error"
      />
    </>
  );
}
