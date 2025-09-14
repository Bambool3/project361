"use client";

import { Indicator } from "@/types/management";
import React, { useState } from "react";
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
  CircularProgress,
  Collapse,
  Alert,
} from "@mui/material";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AddKpiModal from "@/client/components/AddKpiModal";
import ConfirmModal from "@/components/ui/confirm-modal";

interface ManagementTableProps {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function ManagementTable({
  indicators,
  loading,
  error,
  onRefresh,
}: ManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // เก็บ id ของ KPI ที่ expand อยู่
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(
    null
  );
  const [selectedToEdit, setSelectedToEdit] = useState<Indicator | null>(null);
  const filteredKpi = indicators.filter(
    (kpi) =>
      kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.target_value?.toString().includes(searchTerm)
  );

  // สลับส่วนขยาย
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  // เอาไว้ serach
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddKpi = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const indicator = indicators.find((indicator) => indicator.id === id);
    if (indicator) {
      setSelectedToEdit(indicator);
      setModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const indicator = indicators.find((indicator) => indicator.id === id);
    if (indicator) {
      setIndicatorToDelete(indicator);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteIndicatorConfirm = async () => {
    if (!indicatorToDelete) return;

    try {
      const response = await fetch(
        `/api/category-indicators/${indicatorToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setIndicatorToDelete(null);
        alert("ลบตัวชี้วัดสำเร็จ!");
        // showAlert("ลบตัวชี้วัดสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 404) {
        alert("ไม่พบตัวชี้วัดที่ต้องการลบ");
        // showAlert("ไม่พบตัวชี้วัดที่ต้องการลบ", "error");
      } else {
        // showAlert("เกิดข้อผิดพลาดในการลบตัวชี้วัด", "error");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      // showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
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
        sx={{ mb: 3, borderRadius: "16px" }}
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
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent sx={{ p: 0, px: 3.5 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Target size={24} color="#8b5cf6" />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#1e293b" }}
            >
              การจัดการตัวชี้วัด: ({filteredKpi.length})
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              placeholder="ค้นหาตัวชี้วัด..."
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
              onClick={handleAddKpi}
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
              เพิ่มตัวชี้วัด
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
                    width: "70px",
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
                    maxWidth: "80px",
                  }}
                >
                  ชื่อตัวชี้วัด
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
                  ความคืบหน้า
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
                  หน่วย
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
                  ความถี่
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
                  ตัวชี้วัดย่อย
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
              {filteredKpi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="#64748b">
                      {searchTerm
                        ? "ไม่พบตัวชี้วัดที่ค้นหา"
                        : "ไม่มีข้อมูลตัวชี้วัด"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredKpi.map((kpi, kpiIndex) => (
                  <React.Fragment key={kpi.id}>
                    <TableRow
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                        },
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                        }}
                      >
                        {kpiIndex + 1}
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {kpi.sub_indicators?.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => toggleExpand(kpi.id)}
                            >
                              {expanded.has(kpi.id) ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </IconButton>
                          )}
                          <Typography
                            sx={{
                              fontWeight: "600",
                              color: "#1e293b",
                              maxWidth: 600,
                            }}
                          >
                            {kpi.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        /{kpi.target_value}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        {kpi.unit}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        {kpi.responsible_jobtitles?.length
                          ? kpi.responsible_jobtitles
                              .map((r) => r.name)
                              .join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        {kpi.frequency.name || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "0.875rem",
                        }}
                      >
                        <Chip
                          label={`${
                            kpi.sub_indicators?.length || 0
                          } ตัวชี้วัดย่อย`}
                          size="small"
                          sx={{
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={() => handleEdit(kpi.id)}
                            size="small"
                            sx={{
                              color: "#64748b",
                            }}
                          >
                            <Edit size={16} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(kpi.id)}
                            size="small"
                            sx={{
                              color: "#64748b",
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {kpi.sub_indicators?.length > 0 && (
                      <TableRow>
                        <TableCell
                          style={{
                            paddingBottom: 0,
                            paddingTop: 0,
                          }}
                          colSpan={8}
                        >
                          <Collapse
                            in={expanded.has(kpi.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 2, pl: 5 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{
                                        py: 2,
                                        color: "#1e293b",
                                        fontWeight: "550",
                                        borderBottom: "none",
                                      }}
                                    >
                                      รายการตัวชี้วัดย่อย
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        py: 2,
                                        color: "#1e293b",
                                        fontWeight: "550",
                                        borderBottom: "none",
                                      }}
                                    >
                                      ความคืบหน้า
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {kpi.sub_indicators.map((sub, subIndex) => (
                                    <TableRow
                                      key={sub.id}
                                      sx={{
                                        "&:hover": {
                                          backgroundColor: "#f8fafc",
                                        },
                                        "& td": {
                                          borderBottom: "1px solid #f1f5f9",
                                        },
                                        height: 50,
                                      }}
                                    >
                                      <TableCell sx={{ pl: 5 }}>
                                        {kpiIndex + 1}.{subIndex + 1}
                                        &nbsp;&nbsp;{sub.name}
                                      </TableCell>
                                      <TableCell sx={{ pl: 5 }}>
                                        /{sub.target_value}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIndicatorToDelete(null);
        }}
        onConfirm={handleDeleteIndicatorConfirm}
        title="ยืนยันการลบตัวชี้วัด"
        message="คุณต้องการลบตัวชี้วัดนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้"
        confirmText="ลบตัวชี้วัด"
        cancelText="ยกเลิก"
        severity="error"
      >
        {indicatorToDelete && (
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
              ชื่อตัวชี้วัด: {indicatorToDelete.name}
            </Typography>
            {indicatorToDelete.sub_indicators &&
              indicatorToDelete.sub_indicators.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#dc2626",
                    mt: 1.5,
                    fontWeight: "600",
                  }}
                >
                  ⚠️ คำเตือน: ตัวชี้วัดนี้มี{" "}
                  {indicatorToDelete.sub_indicators.length} ตัวชี้วัดย่อย
                </Typography>
              )}
          </Box>
        )}
      </ConfirmModal>
      <AddKpiModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedToEdit(null);
        }}
        mode={selectedToEdit ? "edit" : "add"}
        initialData={selectedToEdit}
      />
    </Card>
  );
}
