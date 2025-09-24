"use client";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ReorderIcon from "@mui/icons-material/Reorder";
import SaveIcon from "@mui/icons-material/Save";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Indicator, IndicatorFormData } from "@/types/management";
import React, { useState } from "react";
import { IndicatorService } from "@/server/services/indicator/indicator-client-service";
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
  Snackbar,
  Tooltip,
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
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import Providers from "@/providers/sessionProviders";

interface ManagementTableProps {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  categoryId: string;
  onRefresh?: () => void;
}

export default function ManagementTable({
  indicators,
  loading,
  error,
  categoryId,
  onRefresh,
}: ManagementTableProps) {
  // ----------------------- STATE -----------------------
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // เก็บ id ของ KPI ที่ expand อยู่

  //  Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(
    null
  );

  // Editing
  const [selectedToEdit, setSelectedToEdit] = useState<Indicator | null>(null);

  // Reorder mode
  const [isReorderMode, setReorderMode] = useState(false);
  const [kpiList, setKpiList] = useState<Indicator[]>([]); // editable list for reorder

  // Snackbar
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "success" | "warning" | "info"
  >("success");

  // ----------------------- FILTERED KPI -----------------------
  const filteredKpi = indicators.filter(
    (kpi) =>
      kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.target_value?.toString().includes(searchTerm)
  );

  const totalCount = filteredKpi.reduce((total, kpi) => {
    // Add the main KPI (which is 1)
    let count = 1;
    // If there are sub-indicators, add their count
    if (kpi.sub_indicators && kpi.sub_indicators.length > 0) {
      count += kpi.sub_indicators.length;
    }
    return total + count;
  }, 0);
  // ----------------------- FUNCTIONS -----------------------

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

  // Add KPI
  const handleAddKpi = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  // Edit KPI
  const handleEdit = (id: string) => {
    const indicator = indicators.find((indicator) => indicator.id === id);
    if (indicator) {
      setSelectedToEdit(indicator);
      setModalOpen(true);
    }
  };

  // Delete KPI
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
      if (!categoryId) {
        showAlert("ไม่พบหมวดหมู่ของตัวชี้วัด", "error");
        return;
      }

      const statusCode = await IndicatorService.deleteIndicatorWithStatus(
        categoryId,
        indicatorToDelete.id
      );

      if (statusCode === 200) {
        setIsDeleteModalOpen(false);
        setIndicatorToDelete(null);
        showAlert("ลบตัวชี้วัดสำเร็จ!", "success");
        if (onRefresh) onRefresh();
      } else if (statusCode === 404) {
        showAlert("ไม่พบตัวชี้วัดที่ต้องการลบ", "error");
      } else {
        showAlert("เกิดข้อผิดพลาดในการลบตัวชี้วัด", "error");
      }
    } catch (error) {
      console.error("Error deleting indicator:", error);
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  // Add / Edit submit
  const handleAdd_EditSubmit = async (
    data: IndicatorFormData,
    mode: "add" | "edit",
    catId: string
  ) => {
    try {
      // console.log(data);
      const payload = {
        name: data.name,
        target_value: parseFloat(data.target_value),
        unit_id: data.unit_id,
        frequency_id: data.frequency_id,
        jobtitle_ids: data.jobtitle_ids || [],
        sub_indicators: (data.sub_indicators || []).map((s, i) => ({
          id: s.id,
          name: s.name.trim(),
          target_value: parseFloat(s.target_value),
          position: i + 1,
        })),
        category_id: catId,
      };

      let statusCode: number;

      if (mode === "edit") {
        // โหมดแก้ไข
        statusCode = await IndicatorService.updateIndicatorWithStatus(
          catId,
          selectedToEdit.id,
          payload
        );
      } else {
        // โหมดเพิ่มใหม่
        // console.log("payload=", payload);
        statusCode = await IndicatorService.createIndicatorWithStatus(payload);
      }

      if (statusCode === 200 || statusCode === 201) {
        // 200 = update, 201 = create
        setModalOpen(false);
        setSelectedToEdit(null);
        showAlert(mode === "edit" ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ", "success");

        if (onRefresh) {
          onRefresh();
        }
      } else if (statusCode === 400) {
        showAlert("กรุณากรอกเป้าหมายให้ถูกต้อง", "error");
      } else if (statusCode === 404) {
        alert("ไม่พบหมวดหมู่ที่ต้องการแก้ไข");
        // showAlert("ไม่พบหมวดหมู่ที่ต้องการแก้ไข", "error");
      } else if (statusCode === 409) {
        showAlert("ชื่อนี้มีอยู่แล้ว กรุณาเปลี่ยนใหม่", "warning");
      } else if (statusCode === 500) {
        showAlert("เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง", "error");
      } else {
        showAlert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้", "error");
      }
    } catch (error) {
      showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

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

  // handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const newList = Array.from(kpiList);
    const [moved] = newList.splice(sourceIndex, 1);
    newList.splice(destIndex, 0, moved);

    // update positions in UI
    const updated = newList.map((it, idx) => ({ ...it, position: idx + 1 }));
    setKpiList(updated);
  };
  // เมื่อกดปุ่ม toggle สลับ <-> บันทึก
  const handleToggleReorder = async () => {
    if (isReorderMode) {
      // กดบันทึก: ส่ง order ไป backend
      // await saveOrder();
      setReorderMode(false);
    } else {
      // เข้าโหมดสลับลำดับ: ให้ใช้ filteredKpi ปัจจุบันเป็น base
      setKpiList(filteredKpi);
      setReorderMode(true);
    }
  };
  const displayedList = isReorderMode ? kpiList : filteredKpi;

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
    <>
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
                การจัดการตัวชี้วัด: ({totalCount})
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
              <Tooltip
                title="เพิ่มตัวชี้วัด"
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
                  arrow: { sx: { color: "#1e293b" } },
                }}
              >
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
              </Tooltip>
              <Tooltip
                title={
                  isReorderMode
                    ? "บันทึกลำดับของตัวชี้วัด"
                    : "สลับลำดับของตัวชี้วัด"
                }
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
                  arrow: { sx: { color: "#1e293b" } },
                }}
              >
                <Button
                  onClick={handleToggleReorder}
                  startIcon={
                    isReorderMode ? (
                      <SaveIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <ReorderIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    backgroundColor: isReorderMode ? "#10b981" : "#8b5cf6",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: "12px",
                    "&:hover": {
                      backgroundColor: isReorderMode ? "#059669" : "#7c3aed",
                    },
                    minWidth: 130,
                    maxWidth: 130,
                    boxShadow: isReorderMode
                      ? "0 8px 16px rgba(139, 92, 246, 0.3)"
                      : "none",
                  }}
                >
                  {isReorderMode ? "บันทึก" : "สลับลำดับ"}
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
                      px: 2,
                      width: "10px",
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
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="indicator-list">
                  {(provided) => (
                    <TableBody
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {displayedList.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            sx={{ textAlign: "center", py: 4 }}
                          >
                            <Typography color="#64748b">
                              {searchTerm
                                ? "ไม่พบตัวชี้วัดที่ค้นหา"
                                : "ไม่มีข้อมูลตัวชี้วัด"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayedList.map((kpi, kpiIndex) => (
                          <Draggable
                            key={kpi.id}
                            draggableId={kpi.id}
                            index={kpiIndex}
                            isDragDisabled={!isReorderMode}
                          >
                            {(draggableProvided, snapshot) => (
                              <React.Fragment>
                                <TableRow
                                  ref={draggableProvided.innerRef}
                                  {...draggableProvided.draggableProps}
                                  sx={{
                                    "&:hover": { backgroundColor: "#f8fafc" },
                                    borderBottom: "1px solid #f1f5f9",
                                    backgroundColor: snapshot.isDragging
                                      ? "#eef2ff"
                                      : "inherit",
                                    boxShadow: snapshot.isDragging
                                      ? "0 4px 12px rgba(0,0,0,0.15)"
                                      : "none",
                                    transform: snapshot.isDragging
                                      ? "scale(1.02)"
                                      : "none",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <TableCell
                                    sx={{
                                      px: 1,
                                      fontWeight: 600,
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {isReorderMode && (
                                        <Box
                                          {...draggableProvided.dragHandleProps}
                                          sx={{
                                            mr: 1,
                                            cursor: snapshot.isDragging
                                              ? "grabbing"
                                              : "grab",
                                          }}
                                        >
                                          <DragIndicatorIcon
                                            fontSize="medium"
                                            sx={{ color: "#8b5cf6" }}
                                          />
                                        </Box>
                                      )}
                                      <Box
                                        sx={{ flex: 1, textAlign: "center" }}
                                      >
                                        {kpiIndex + 1}
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ py: 1, px: 0 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontWeight: "600",
                                          color: "#1e293b",
                                          maxWidth: 600,
                                        }}
                                      >
                                        {kpi.name}
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
                                    {kpi.actual_value ? kpi.actual_value : "-"}/
                                    {kpi.target_value}
                                    {kpi.trend === "up" && (
                                      <TrendingUpIcon
                                        sx={{
                                          color: "#22c55e",
                                          fontSize: "1.25rem",
                                          ml: 1,
                                          filter: `drop-shadow(0 0 5px #22c55e)`,
                                        }}
                                      />
                                    )}
                                    {kpi.trend === "down" && (
                                      <TrendingDownIcon
                                        sx={{
                                          color: "red",
                                          fontSize: "1.25rem",
                                          ml: 1,
                                          filter: `drop-shadow(0 0 2px #c56922ff)`,
                                        }}
                                      />
                                    )}
                                    {kpi.trend === "same" && (
                                      <Typography
                                        component="span"
                                        sx={{
                                          color: "#64748b",
                                          fontSize: "1rem",
                                          ml: 1,
                                        }}
                                      >
                                        ➖
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell
                                    sx={{
                                      textAlign: "center",
                                      color: "#64748b",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {kpi.unit.name}
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
                                      <Tooltip
                                        title="แก้ไขข้อมูลตัวชี้วัด"
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
                                          arrow: { sx: { color: "#1e293b" } },
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
                                      </Tooltip>
                                      <Tooltip
                                        title="ลบตัวชี้วัดนี้ออกจากระบบ"
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
                                          arrow: { sx: { color: "#1e293b" } },
                                        }}
                                      >
                                        <IconButton
                                          onClick={() => handleDelete(kpi.id)}
                                          size="small"
                                          sx={{
                                            color: "#64748b",
                                          }}
                                        >
                                          <Trash2 size={16} />
                                        </IconButton>
                                      </Tooltip>
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
                                                    py: 0,
                                                    color: "#1e293b",
                                                    fontWeight: "550",
                                                    borderBottom: "none",
                                                  }}
                                                >
                                                  รายการตัวชี้วัดย่อย
                                                </TableCell>
                                                <TableCell
                                                  sx={{
                                                    py: 0,
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
                                              {kpi.sub_indicators.map(
                                                (sub, subIndex) => (
                                                  <TableRow
                                                    key={sub.id}
                                                    sx={{
                                                      "&:hover": {
                                                        backgroundColor:
                                                          "#f8fafc",
                                                      },
                                                      "& td": {
                                                        borderBottom:
                                                          "1px solid #f1f5f9",
                                                      },
                                                      height: 50,
                                                    }}
                                                  >
                                                    <TableCell
                                                      sx={{ pl: 4, py: 0 }}
                                                    >
                                                      {kpiIndex + 1}.
                                                      {subIndex + 1}
                                                      &nbsp;&nbsp;{sub.name}
                                                    </TableCell>
                                                    <TableCell
                                                      sx={{ pl: 5, py: 0 }}
                                                    >
                                                      {sub.actual_value
                                                        ? sub.actual_value
                                                        : "-"}
                                                      /{sub.target_value}
                                                      {sub.trend === "up" && (
                                                        <TrendingUpIcon
                                                          sx={{
                                                            color: "#22c55e",
                                                            fontSize: "1.25rem",
                                                            ml: 1,
                                                            filter: `drop-shadow(0 0 5px #22c55e)`,
                                                          }}
                                                        />
                                                      )}
                                                      {sub.trend === "down" && (
                                                        <TrendingDownIcon
                                                          sx={{
                                                            color: "red",
                                                            fontSize: "1.25rem",
                                                            ml: 1,
                                                            filter: `drop-shadow(0 0 2px #c56922ff)`,
                                                          }}
                                                        />
                                                      )}
                                                      {sub.trend === "same" && (
                                                        <Typography
                                                          component="span"
                                                          sx={{
                                                            color: "#64748b",
                                                            fontSize: "1rem",
                                                            ml: 1,
                                                          }}
                                                        >
                                                          ➖
                                                        </Typography>
                                                      )}
                                                    </TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                    <TableCell
                                                      colSpan={8}
                                                    ></TableCell>
                                                  </TableRow>
                                                )
                                              )}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </DragDropContext>
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
          categoryId={categoryId} // <-- ส่งไปให้ modal เผื่ออนาคต model ใช้หน้าอื่นได้
          //เพิ่ม func ส่ง submit
          onSubmit={handleAdd_EditSubmit}
        />
      </Card>
      {/* Snackbar for notifications */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: 15000 }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{
            zIndex: 15000,
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
