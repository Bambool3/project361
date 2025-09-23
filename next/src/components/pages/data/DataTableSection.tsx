"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Database,
  ChevronDown,
  ChevronRight,
  Save,
  Calendar,
  Clock,
  SortAsc,
} from "lucide-react";
import { Indicator } from "@/types/management";
import { FrequencyPeriod, Frequency } from "@/types/frequency";

interface DataTableSectionProps {
  indicators: Indicator[];
  periods: FrequencyPeriod[];
  loading: boolean;
  error: string | null;
  categoryId: string;
  onRefresh?: () => void;
}

interface IndicatorDataEntry {
  indicatorId: string;
  periodId: string;
  actualValue: string;
  isModified: boolean;
}

export default function DataTableSection({
  indicators,
  periods,
  loading,
  error,
  categoryId,
  onRefresh,
}: DataTableSectionProps) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedFrequencyGroups, setExpandedFrequencyGroups] = useState<
    Set<string>
  >(new Set());
  const [dataEntries, setDataEntries] = useState<
    Map<string, IndicatorDataEntry>
  >(new Map());
  const [saving, setSaving] = useState(false);
  const [sortMode, setSortMode] = useState<"frequency" | "deadline">(
    "frequency"
  );
  const [showPeriodDetails, setShowPeriodDetails] = useState(false);

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "success" | "warning" | "info"
  >("success");

  useEffect(() => {
    if (indicators.length > 0 && periods.length > 0) {
      loadExistingData(indicators, periods);
    }
  }, [indicators, periods]);

  useEffect(() => {
    if (indicators.length > 0) {
      const frequencyGroups = groupIndicatorsByFrequency();
      const frequencyIds = Object.keys(frequencyGroups);

      if (sortMode === "deadline") {
        // In urgency mode, expand groups with urgent periods
        const urgentGroups = frequencyIds.filter((frequencyId) => {
          const group = frequencyGroups[frequencyId];
          return group.relevantPeriods.some((period: FrequencyPeriod) => {
            const urgency = getPeriodUrgency(period);
            return urgency === "overdue" || urgency === "due-soon";
          });
        });

        if (urgentGroups.length > 0) {
          setExpandedFrequencyGroups(new Set(urgentGroups));
        } else if (frequencyIds.length > 0) {
          // If no urgent groups, expand the first one
          setExpandedFrequencyGroups(new Set([frequencyIds[0]]));
        }
      } else {
        // In frequency mode, expand the first group by default
        if (frequencyIds.length > 0) {
          setExpandedFrequencyGroups(new Set([frequencyIds[0]]));
        }
      }
    }
  }, [indicators, sortMode]);

  // Load existing indicator data from the database
  const loadExistingData = async (
    indicators: Indicator[],
    periods: FrequencyPeriod[]
  ) => {
    try {
      const dataMap = new Map<string, IndicatorDataEntry>();

      // Load data for all indicators (main and sub)
      for (const indicator of indicators) {
        // Load main indicator data
        const response = await fetch(
          `/api/indicator-data?indicatorId=${indicator.id}`
        );
        if (response.ok) {
          const indicatorData = await response.json();

          indicatorData.forEach((data: any) => {
            const key = getDataEntryKey(indicator.id, data.period_id);
            dataMap.set(key, {
              indicatorId: indicator.id,
              periodId: data.period_id,
              actualValue: data.actual_value?.toString() || "",
              isModified: false,
            });
          });
        }

        // Load sub-indicator data
        if (indicator.sub_indicators?.length > 0) {
          for (const subIndicator of indicator.sub_indicators) {
            const subResponse = await fetch(
              `/api/indicator-data?indicatorId=${subIndicator.id}`
            );
            if (subResponse.ok) {
              const subIndicatorData = await subResponse.json();

              subIndicatorData.forEach((data: any) => {
                const key = getDataEntryKey(subIndicator.id, data.period_id);
                dataMap.set(key, {
                  indicatorId: subIndicator.id,
                  periodId: data.period_id,
                  actualValue: data.actual_value?.toString() || "",
                  isModified: false,
                });
              });
            }
          }
        }
      }

      setDataEntries(dataMap);
    } catch (error) {
      console.error("Error loading existing data:", error);
    }
  };

  const filteredIndicators = indicators.filter((indicator) => {
    const matchesSearch =
      indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.unit.name.toLowerCase().includes(searchTerm.toLowerCase());

    const isSubIndicator = indicators.some((mainIndicator) =>
      mainIndicator.sub_indicators?.some((sub) => sub.id === indicator.id)
    );

    return matchesSearch && !isSubIndicator;
  });

  // Group indicators by frequency
  const groupIndicatorsByFrequency = () => {
    const groups: {
      [key: string]: {
        frequency: {
          frequency_id: string;
          name: string;
          periods_in_year: number;
        };
        indicators: Indicator[];
        relevantPeriods: FrequencyPeriod[];
      };
    } = {};

    // Ensure we only work with main indicators (already filtered by filteredIndicators)
    filteredIndicators.forEach((indicator) => {
      const frequencyId = indicator.frequency.frequency_id;

      if (!groups[frequencyId]) {
        const relevantPeriods = periods.filter(
          (period) => period.frequency_id === frequencyId
        );

        groups[frequencyId] = {
          frequency: {
            frequency_id: indicator.frequency.frequency_id,
            name: indicator.frequency.name,
            periods_in_year: indicator.frequency.periods_in_year,
          },
          indicators: [],
          relevantPeriods,
        };
      }

      groups[frequencyId].indicators.push(indicator);
    });

    // Sort indicators within each group - completed indicators at bottom
    Object.values(groups).forEach((group) => {
      group.indicators.sort((a, b) => {
        // First, check completion status - incomplete indicators come first
        const aCompleted = isIndicatorCompleted(a);
        const bCompleted = isIndicatorCompleted(b);

        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;

        // If both have same completion status, sort by upcoming periods
        const aNextPeriod = getNextUpcomingPeriod(a, group.relevantPeriods);
        const bNextPeriod = getNextUpcomingPeriod(b, group.relevantPeriods);

        if (!aNextPeriod && !bNextPeriod) return 0;
        if (!aNextPeriod) return 1;
        if (!bNextPeriod) return -1;

        return (
          new Date(aNextPeriod.start_date).getTime() -
          new Date(bNextPeriod.start_date).getTime()
        );
      });
    });

    return groups;
  };

  const getNextUpcomingPeriod = (
    indicator: Indicator,
    relevantPeriods?: FrequencyPeriod[]
  ): FrequencyPeriod | null => {
    const periodsToCheck =
      relevantPeriods ||
      periods.filter(
        (p) => p.frequency_id === indicator.frequency.frequency_id
      );
    const now = new Date();

    return (
      periodsToCheck.find((period) => new Date(period.end_date) > now) || null
    );
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleFrequencyGroup = (frequencyId: string) => {
    setExpandedFrequencyGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(frequencyId)) newSet.delete(frequencyId);
      else newSet.add(frequencyId);
      return newSet;
    });
  };

  const toggleAllFrequencyGroups = () => {
    const frequencyGroups = groupIndicatorsByFrequency();
    const allFrequencyIds = Object.keys(frequencyGroups);

    if (expandedFrequencyGroups.size === allFrequencyIds.length) {
      setExpandedFrequencyGroups(new Set());
    } else {
      setExpandedFrequencyGroups(new Set(allFrequencyIds));
    }
  };

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

  const handleDataInput = (
    indicatorId: string,
    periodId: string,
    value: string
  ) => {
    const key = `${indicatorId}-${periodId}`;
    setDataEntries((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, {
        indicatorId,
        periodId,
        actualValue: value,
        isModified: true,
      });
      return newMap;
    });
  };

  const validateDataEntry = (
    value: string
  ): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "กรุณากรอกค่าผลลัพธ์" };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, message: "กรุณากรอกตัวเลขที่ถูกต้อง" };
    }

    if (numValue < 0) {
      return { isValid: false, message: "ค่าผลลัพธ์ต้องไม่เป็นลบ" };
    }

    return { isValid: true };
  };

  const getDataEntryKey = (indicatorId: string, periodId: string) =>
    `${indicatorId}-${periodId}`;

  // Calculate total for an indicator across all periods (updated for grouped structure)
  const calculateIndicatorTotal = (indicatorId: string): number => {
    let total = 0;

    // Get the indicator to find its frequency
    const indicator = indicators.find((ind) => ind.id === indicatorId);
    if (!indicator) return 0;

    // Get relevant periods for this indicator's frequency
    const relevantPeriods = periods.filter(
      (p) => p.frequency_id === indicator.frequency.frequency_id
    );

    // Sum main indicator values across relevant periods
    relevantPeriods.forEach((period) => {
      const key = getDataEntryKey(indicatorId, period.period_id);
      const entry = dataEntries.get(key);
      if (entry && entry.actualValue) {
        const value = parseFloat(entry.actualValue);
        if (!isNaN(value)) {
          total += value;
        }
      }
    });

    // Add sub-indicator values
    if (indicator?.sub_indicators) {
      indicator.sub_indicators.forEach((subIndicator) => {
        relevantPeriods.forEach((period) => {
          const key = getDataEntryKey(subIndicator.id, period.period_id);
          const entry = dataEntries.get(key);
          if (entry && entry.actualValue) {
            const value = parseFloat(entry.actualValue);
            if (!isNaN(value)) {
              total += value;
            }
          }
        });
      });
    }

    return total;
  };

  // Get color for total based on target achievement
  const getTotalColor = (total: number, target: number): string => {
    if (total >= target) {
      return "#059669";
    } else {
      return "#d97706";
    }
  };

  // Check if an indicator is completed (total >= target and all periods have values)
  const isIndicatorCompleted = (indicator: Indicator): boolean => {
    // Get relevant periods for this indicator's frequency
    const relevantPeriods = periods.filter(
      (p) => p.frequency_id === indicator.frequency.frequency_id
    );

    // Calculate total value
    const total = calculateIndicatorTotal(indicator.id);

    // Check if total meets or exceeds target
    if (total < (indicator.target_value || 0)) {
      return false;
    }

    // Check if all periods have values filled for main indicator
    const allMainPeriodsHaveValues = relevantPeriods.every((period) => {
      const key = getDataEntryKey(indicator.id, period.period_id);
      const entry = dataEntries.get(key);
      return entry && entry.actualValue && entry.actualValue.trim() !== "";
    });

    if (!allMainPeriodsHaveValues) {
      return false;
    }

    // Check if all periods have values filled for sub-indicators (if any)
    if (indicator.sub_indicators && indicator.sub_indicators.length > 0) {
      const allSubPeriodsHaveValues = indicator.sub_indicators.every(
        (subIndicator) =>
          relevantPeriods.every((period) => {
            const key = getDataEntryKey(subIndicator.id, period.period_id);
            const entry = dataEntries.get(key);
            return (
              entry && entry.actualValue && entry.actualValue.trim() !== ""
            );
          })
      );

      if (!allSubPeriodsHaveValues) {
        return false;
      }
    }

    return true;
  };

  // Get period urgency level
  const getPeriodUrgency = (
    period: FrequencyPeriod
  ): "overdue" | "due-soon" | "normal" => {
    const today = new Date();
    const endDate = new Date(period.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 7) return "due-soon";
    return "normal";
  };

  // Get period urgency color
  const getPeriodUrgencyColor = (
    urgency: "overdue" | "due-soon" | "normal"
  ): string => {
    switch (urgency) {
      case "overdue":
        return "#dc2626";
      case "due-soon":
        return "#d97706";
      default:
        return "#64748b";
    }
  };

  // Sort indicators by nearest deadline
  const sortIndicatorsByDeadline = (
    indicators: Indicator[],
    relevantPeriods: FrequencyPeriod[]
  ): Indicator[] => {
    // Ensure we only work with main indicators (filter out any sub-indicators)
    const mainIndicators = indicators.filter((indicator) => {
      const isSubIndicator = indicators.some((mainIndicator) =>
        mainIndicator.sub_indicators?.some((sub) => sub.id === indicator.id)
      );
      return !isSubIndicator;
    });

    return [...mainIndicators].sort((a, b) => {
      // First, check completion status - incomplete indicators come first
      const aCompleted = isIndicatorCompleted(a);
      const bCompleted = isIndicatorCompleted(b);

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Find the most urgent period (overdue or due soon)
      const urgentPeriods = relevantPeriods.filter((p) => {
        const urgency = getPeriodUrgency(p);
        return urgency === "overdue" || urgency === "due-soon";
      });

      if (urgentPeriods.length > 0) {
        // If there are urgent periods, sort by completion status for those periods
        const aUrgentTotal = urgentPeriods.reduce((sum, period) => {
          const key = getDataEntryKey(a.id, period.period_id);
          const entry = dataEntries.get(key);
          return (
            sum + (entry?.actualValue ? parseFloat(entry.actualValue) || 0 : 0)
          );
        }, 0);

        const bUrgentTotal = urgentPeriods.reduce((sum, period) => {
          const key = getDataEntryKey(b.id, period.period_id);
          const entry = dataEntries.get(key);
          return (
            sum + (entry?.actualValue ? parseFloat(entry.actualValue) || 0 : 0)
          );
        }, 0);

        // Sort by completion: incomplete indicators first (lower values first)
        const aCompletionRatio = aUrgentTotal / (a.target_value || 1);
        const bCompletionRatio = bUrgentTotal / (b.target_value || 1);

        if (aCompletionRatio !== bCompletionRatio) {
          return aCompletionRatio - bCompletionRatio;
        }
      }

      // If no urgent periods or same completion ratio, sort by target value (higher targets first)
      return (b.target_value || 0) - (a.target_value || 0);
    });
  };

  // Sort frequency groups by urgency level
  const sortFrequencyGroupsByUrgency = (
    groupEntries: [string, any][]
  ): [string, any][] => {
    return [...groupEntries].sort(([aFreqId, aGroup], [bFreqId, bGroup]) => {
      // Calculate urgency score for each frequency group
      const getGroupUrgencyScore = (group: any): number => {
        let urgencyScore = 0;

        // Check periods urgency
        group.relevantPeriods.forEach((period: FrequencyPeriod) => {
          const urgency = getPeriodUrgency(period);
          if (urgency === "overdue") urgencyScore += 100;
          else if (urgency === "due-soon") urgencyScore += 50;
        });

        // Check indicators completion for urgent periods
        group.indicators.forEach((indicator: Indicator) => {
          const urgentPeriods = group.relevantPeriods.filter(
            (p: FrequencyPeriod) => {
              const urgency = getPeriodUrgency(p);
              return urgency === "overdue" || urgency === "due-soon";
            }
          );

          if (urgentPeriods.length > 0) {
            const totalForUrgentPeriods = urgentPeriods.reduce(
              (sum: number, period: FrequencyPeriod) => {
                const key = getDataEntryKey(indicator.id, period.period_id);
                const entry = dataEntries.get(key);
                return (
                  sum +
                  (entry?.actualValue ? parseFloat(entry.actualValue) || 0 : 0)
                );
              },
              0
            );

            const completionRatio =
              totalForUrgentPeriods / (indicator.target_value || 1);
            // Add penalty for incomplete indicators (lower completion = higher urgency)
            urgencyScore += (1 - Math.min(completionRatio, 1)) * 25;
          }
        });

        return urgencyScore;
      };

      const aUrgency = getGroupUrgencyScore(aGroup);
      const bUrgency = getGroupUrgencyScore(bGroup);

      // Sort by urgency score descending (most urgent first)
      return bUrgency - aUrgency;
    });
  };

  const handleSaveData = async (indicatorId: string, periodId: string) => {
    const key = getDataEntryKey(indicatorId, periodId);
    const entry = dataEntries.get(key);

    if (!entry || !entry.isModified) return;

    // Validate input
    const validation = validateDataEntry(entry.actualValue);
    if (!validation.isValid) {
      showAlert(validation.message || "ข้อมูลไม่ถูกต้อง", "warning");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/indicator-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indicatorId: entry.indicatorId,
          periodId: entry.periodId,
          actualValue: parseFloat(entry.actualValue),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save data");
      }

      const result = await response.json();

      showAlert("บันทึกข้อมูลสำเร็จ", "success");

      setDataEntries((prev) => {
        const newMap = new Map(prev);
        const updatedEntry = { ...entry, isModified: false };
        newMap.set(key, updatedEntry);
        return newMap;
      });
    } catch (error) {
      console.error("Error saving data:", error);
      showAlert(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllModified = async () => {
    const modifiedEntries = Array.from(dataEntries.values()).filter(
      (entry) => entry.isModified
    );

    if (modifiedEntries.length === 0) {
      showAlert("ไม่มีข้อมูลที่ต้องบันทึก", "info");
      return;
    }

    try {
      setSaving(true);

      for (const entry of modifiedEntries) {
        const validation = validateDataEntry(entry.actualValue);
        if (!validation.isValid) {
          showAlert(`ข้อมูลไม่ถูกต้อง: ${validation.message}`, "warning");
          return;
        }
      }

      const entriesToSave = modifiedEntries.map((entry) => ({
        indicatorId: entry.indicatorId,
        periodId: entry.periodId,
        actualValue: parseFloat(entry.actualValue),
      }));

      const response = await fetch("/api/indicator-data/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entries: entriesToSave,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save data");
      }

      const result = await response.json();

      showAlert(`บันทึกข้อมูลสำเร็จ ${result.count} รายการ`, "success");

      setDataEntries((prev) => {
        const newMap = new Map(prev);
        modifiedEntries.forEach((entry) => {
          const key = getDataEntryKey(entry.indicatorId, entry.periodId);
          const updatedEntry = { ...entry, isModified: false };
          newMap.set(key, updatedEntry);
        });
        return newMap;
      });
    } catch (error) {
      console.error("Error batch saving data:", error);
      showAlert(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        "error"
      );
    } finally {
      setSaving(false);
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
          <CircularProgress size={40} sx={{ color: "#8b5cf6", mb: 2 }} />
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            กำลังโหลดข้อมูลตัวชี้วัด...
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
          borderRadius: "16px",
          border: "1px solid #fecaca",
          mb: 3,
        }}
        action={
          onRefresh && (
            <Button color="inherit" size="small" onClick={onRefresh}>
              ลองใหม่
            </Button>
          )
        }
      >
        เกิดข้อผิดพลาด: {error}
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
        <CardContent sx={{ p: 0 }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: { xs: "flex-start", lg: "space-between" },
              p: { xs: 2, sm: 3 },
              gap: { xs: 2, lg: 0 },
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: { xs: 1, lg: 0 },
              }}
            >
              <Database size={24} color="#8b5cf6" />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#1e293b",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                ป้อนข้อมูลตัวชี้วัด: ({filteredIndicators.length})
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 1.5, sm: 2 },
                width: { xs: "100%", lg: "auto" },
              }}
            >
              <TextField
                placeholder="ค้นหาตัวชี้วัด..."
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                sx={{
                  width: { xs: "100%", sm: "250px", md: "300px" },
                  order: { xs: 1, sm: 0 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
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
                      <Search size={20} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
              />

              <ToggleButtonGroup
                value={sortMode}
                exclusive
                onChange={(event, newSortMode) => {
                  if (newSortMode !== null) {
                    setSortMode(newSortMode);
                  }
                }}
                size="small"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  order: { xs: 2, sm: 0 },
                  "& .MuiToggleButtonGroup-root": {
                    width: { xs: "100%", sm: "auto" },
                  },
                  "& .MuiToggleButton-root": {
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: 0.5,
                    flex: { xs: 1, sm: "none" },
                    "&.Mui-selected": {
                      backgroundColor: "#8b5cf6",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#7c3aed",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                    },
                  },
                }}
              >
                <ToggleButton value="frequency" aria-label="จัดกลุ่มตามความถี่">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Calendar size={18} />
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      ตามความถี่
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", sm: "none" } }}
                    >
                      ความถี่
                    </Box>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="deadline"
                  aria-label="เรียงตามความเร่งด่วน"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Clock size={18} />
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      ตามความเร่งด่วน
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", sm: "none" } }}
                    >
                      เร่งด่วน
                    </Box>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", sm: "row" },
                  gap: { xs: 1, sm: 2 },
                  order: { xs: 3, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                  "& > *": {
                    flex: { xs: 1, sm: "none" },
                    minWidth: { xs: 0, sm: "auto" },
                  },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={toggleAllFrequencyGroups}
                  size="small"
                  sx={{
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    "&:hover": {
                      borderColor: "#8b5cf6",
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                  startIcon={(() => {
                    const frequencyGroups = groupIndicatorsByFrequency();
                    const allFrequencyIds = Object.keys(frequencyGroups);
                    const allExpanded =
                      expandedFrequencyGroups.size === allFrequencyIds.length;
                    return allExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    );
                  })()}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    {(() => {
                      const frequencyGroups = groupIndicatorsByFrequency();
                      const allFrequencyIds = Object.keys(frequencyGroups);
                      const allExpanded =
                        expandedFrequencyGroups.size === allFrequencyIds.length;
                      return allExpanded ? "ย่อทั้งหมด" : "ขยายทั้งหมด";
                    })()}
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    {(() => {
                      const frequencyGroups = groupIndicatorsByFrequency();
                      const allFrequencyIds = Object.keys(frequencyGroups);
                      const allExpanded =
                        expandedFrequencyGroups.size === allFrequencyIds.length;
                      return allExpanded ? "ย่อ" : "ขยาย";
                    })()}
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setShowPeriodDetails(!showPeriodDetails)}
                  size="small"
                  sx={{
                    borderColor: "#e2e8f0",
                    color: showPeriodDetails ? "#8b5cf6" : "#64748b",
                    backgroundColor: showPeriodDetails
                      ? "#f3f4f6"
                      : "transparent",
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    "&:hover": {
                      borderColor: "#8b5cf6",
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                  startIcon={<Calendar size={18} />}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    {showPeriodDetails ? "ซ่อนวันที่" : "แสดงวันที่"}
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    {showPeriodDetails ? "ซ่อน" : "วันที่"}
                  </Box>
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSaveAllModified}
                  disabled={
                    saving ||
                    Array.from(dataEntries.values()).filter(
                      (entry) => entry.isModified
                    ).length === 0
                  }
                  sx={{
                    backgroundColor: "#059669",
                    "&:hover": { backgroundColor: "#047857" },
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "500",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                  }}
                  startIcon={
                    saving ? <CircularProgress size={18} /> : <Save size={18} />
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    บันทึกทั้งหมด
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    บันทึก
                  </Box>
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Grouped Tables Section */}
          {(() => {
            const frequencyGroups = groupIndicatorsByFrequency();
            let groupEntries = Object.entries(frequencyGroups);

            // Sort frequency groups by urgency when in deadline mode
            if (sortMode === "deadline") {
              groupEntries = sortFrequencyGroupsByUrgency(groupEntries);
            }

            if (groupEntries.length === 0) {
              return (
                <Box
                  sx={{
                    p: 6,
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Database
                    size={48}
                    color="#cbd5e1"
                    style={{ marginBottom: "16px" }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#475569",
                      mb: 1,
                      fontWeight: "600",
                    }}
                  >
                    {searchTerm
                      ? "ไม่พบตัวชี้วัดที่ค้นหา"
                      : "ไม่มีตัวชี้วัดที่คุณรับผิดชอบ"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {searchTerm
                      ? "ลองใช้คำค้นหาอื่น หรือตรวจสอบการสะกดคำ"
                      : "กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดตัวชี้วัดให้คุณ"}
                  </Typography>
                </Box>
              );
            }

            return groupEntries.map(([frequencyId, group], groupIndex) => (
              <Box
                key={frequencyId}
                sx={{
                  mb: groupIndex < groupEntries.length - 1 ? 4 : 0,
                }}
              >
                {/* Frequency Header */}
                <Box
                  onClick={() => toggleFrequencyGroup(frequencyId)}
                  sx={{
                    p: 2.5,
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    // borderLeft: "4px solid #8b5cf6",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      // borderLeftColor: "#7c3aed",
                    },
                    transition: "all 0.2s ease",
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      p: 0.75,
                      color: "#8b5cf6",
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "rgba(139, 92, 246, 0.2)",
                        color: "#7c3aed",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {expandedFrequencyGroups.has(frequencyId) ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </IconButton>
                  <Calendar size={20} color="#8b5cf6" />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#1e293b",
                      fontSize: "1rem",
                      flex: 1,
                    }}
                  >
                    ความถี่: {group.frequency.name}
                  </Typography>
                  <Chip
                    label={(() => {
                      const mainCount = group.indicators.length;
                      const totalSubCount = group.indicators.reduce(
                        (sum, indicator) =>
                          sum + (indicator.sub_indicators?.length || 0),
                        0
                      );
                      const totalCount = mainCount + totalSubCount;
                      return `ตัวชี้วัดหลัก: ${mainCount} | รวมทั้งหมด: ${totalCount}`;
                    })()}
                    size="small"
                    sx={{
                      backgroundColor: "#e0e7ff",
                      color: "#3730a3",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      borderRadius: "6px",
                    }}
                  />
                  {sortMode === "deadline" &&
                    (() => {
                      const urgentPeriods = group.relevantPeriods.filter(
                        (p: FrequencyPeriod) => {
                          const urgency = getPeriodUrgency(p);
                          return (
                            urgency === "overdue" || urgency === "due-soon"
                          );
                        }
                      );

                      if (urgentPeriods.length > 0) {
                        const overduePeriods = urgentPeriods.filter(
                          (p: FrequencyPeriod) =>
                            getPeriodUrgency(p) === "overdue"
                        );

                        return (
                          <Chip
                            label={
                              overduePeriods.length > 0
                                ? `เกินกำหนด ${overduePeriods.length} ช่วง`
                                : `ใกล้กำหนด ${urgentPeriods.length} ช่วง`
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                overduePeriods.length > 0
                                  ? "#dc2626"
                                  : "#d97706",
                              color: "white",
                              fontSize: "0.65rem",
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                </Box>

                {/* Table for this frequency group */}
                <Collapse
                  in={expandedFrequencyGroups.has(frequencyId)}
                  timeout="auto"
                  unmountOnExit
                >
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: { xs: 800, sm: 1000 } }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          {/* Column 1: ลำดับ */}
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#475569",
                              border: "none",
                              py: { xs: 2, sm: 3 },
                              px: { xs: 1, sm: 2 },
                              width: { xs: "60px", sm: "80px" },
                              textAlign: "center",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            ลำดับ
                          </TableCell>

                          {/* Column 2: ชื่อตัวชี้วัด */}
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#475569",
                              border: "none",
                              py: { xs: 2, sm: 3 },
                              px: { xs: 1, sm: 2 },
                              minWidth: { xs: "200px", sm: "300px" },
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            ชื่อตัวชี้วัด
                          </TableCell>

                          {/* Period columns - only relevant periods for this frequency */}
                          {group.relevantPeriods.map((period) => {
                            const urgency = getPeriodUrgency(period);
                            const urgencyColor = getPeriodUrgencyColor(urgency);

                            return (
                              <TableCell
                                key={period.period_id}
                                sx={{
                                  fontWeight: "bold",
                                  color: urgencyColor,
                                  border: "none",
                                  py: { xs: 2, sm: 3 },
                                  px: { xs: 0.5, sm: 2 },
                                  textAlign: "center",
                                  minWidth: { xs: "100px", sm: "150px" },
                                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                }}
                              >
                                <Tooltip
                                  title={
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        <strong>{period.name}</strong>
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        เริ่ม:{" "}
                                        {new Date(
                                          period.start_date
                                        ).toLocaleDateString("th-TH", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        สิ้นสุด:{" "}
                                        {new Date(
                                          period.end_date
                                        ).toLocaleDateString("th-TH", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </Typography>
                                    </Box>
                                  }
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
                                        maxWidth: "none",
                                      },
                                    },
                                    arrow: {
                                      sx: {
                                        color: "#1e293b",
                                      },
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      cursor: "help",
                                    }}
                                  >
                                    {period.name}
                                    {showPeriodDetails && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          display: { xs: "none", sm: "block" },
                                          fontSize: "0.6rem",
                                          color:
                                            urgency === "overdue"
                                              ? "#dc2626"
                                              : urgency === "due-soon"
                                              ? "#d97706"
                                              : "#64748b",
                                          fontWeight: "normal",
                                          mt: 0.25,
                                        }}
                                      >
                                        {new Date(
                                          period.start_date
                                        ).toLocaleDateString("th-TH", {
                                          day: "2-digit",
                                          month: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          period.end_date
                                        ).toLocaleDateString("th-TH", {
                                          day: "2-digit",
                                          month: "2-digit",
                                        })}
                                      </Typography>
                                    )}
                                  </Box>
                                </Tooltip>
                                {urgency === "overdue" && (
                                  <Chip
                                    label="เกินกำหนด"
                                    size="small"
                                    sx={{
                                      ml: { xs: 0.5, sm: 1 },
                                      mt: { xs: 0.5, sm: 0 },
                                      backgroundColor: "#dc2626",
                                      color: "white",
                                      fontSize: { xs: "0.6rem", sm: "0.65rem" },
                                      height: { xs: "16px", sm: "18px" },
                                      display: {
                                        xs: "none",
                                        sm: "inline-flex",
                                      },
                                    }}
                                  />
                                )}
                                {urgency === "due-soon" && (
                                  <Chip
                                    label="ใกล้กำหนด"
                                    size="small"
                                    sx={{
                                      ml: { xs: 0.5, sm: 1 },
                                      mt: { xs: 0.5, sm: 0 },
                                      backgroundColor: "#d97706",
                                      color: "white",
                                      fontSize: { xs: "0.6rem", sm: "0.65rem" },
                                      height: { xs: "16px", sm: "18px" },
                                      display: {
                                        xs: "none",
                                        sm: "inline-flex",
                                      },
                                    }}
                                  />
                                )}
                              </TableCell>
                            );
                          })}

                          {/* Total column */}
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#475569",
                              border: "none",
                              py: { xs: 2, sm: 3 },
                              px: { xs: 0.5, sm: 2 },
                              textAlign: "center",
                              minWidth: { xs: "80px", sm: "140px" },
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            รวม
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          const indicatorsToRender =
                            sortMode === "deadline"
                              ? sortIndicatorsByDeadline(
                                  group.indicators,
                                  group.relevantPeriods
                                )
                              : group.indicators;

                          return indicatorsToRender.map((indicator, index) => (
                            <React.Fragment key={indicator.id}>
                              {/* Main Indicator Row */}
                              <TableRow
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "#f8fafc",
                                  },
                                  borderBottom: "1px solid #f1f5f9",
                                }}
                              >
                                {/* ลำดับ */}
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    color: "#1e293b",
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    fontWeight: "600",
                                    verticalAlign: "top",
                                    py: { xs: 2, sm: 3 },
                                    px: { xs: 1, sm: 2 },
                                  }}
                                >
                                  {index + 1}
                                </TableCell>

                                {/* ชื่อตัวชี้วัด */}
                                <TableCell
                                  sx={{
                                    py: { xs: 2, sm: 3 },
                                    px: { xs: 1, sm: 2 },
                                    verticalAlign: "top",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 1,
                                      flexWrap: "nowrap",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontWeight: "600",
                                        color: "#1e293b",
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.9rem",
                                        },
                                        flex: 1,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {indicator.name}
                                    </Typography>

                                    {indicator.sub_indicators?.length > 0 && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() =>
                                          toggleExpand(indicator.id)
                                        }
                                        sx={{
                                          fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.75rem",
                                          },
                                          color: "#8b5cf6",
                                          textTransform: "none",
                                          minWidth: "auto",
                                          p: { xs: 0.25, sm: 0.5 },
                                          whiteSpace: "nowrap",
                                          flexShrink: 0,
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(139, 92, 246, 0.1)",
                                          },
                                        }}
                                      >
                                        {expanded.has(indicator.id)
                                          ? "ซ่อน"
                                          : "ดูเพิ่มเติม"}
                                      </Button>
                                    )}
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                      color: "#64748b",
                                      mt: 0.5,
                                    }}
                                  >
                                    เป้าหมาย: {indicator.target_value}
                                    {"   "}
                                    หน่วย: {indicator.unit.name}
                                    {"   "}
                                    ตัวชี้วัดย่อย:{" "}
                                    {indicator.sub_indicators.length}
                                  </Typography>
                                </TableCell>

                                {/* Period columns with input boxes - only relevant periods */}
                                {group.relevantPeriods.map((period) => {
                                  const dataKey = getDataEntryKey(
                                    indicator.id,
                                    period.period_id
                                  );
                                  const currentEntry = dataEntries.get(dataKey);
                                  const urgency = getPeriodUrgency(period);

                                  return (
                                    <TableCell
                                      key={period.period_id}
                                      sx={{
                                        textAlign: "center",
                                        py: { xs: 1.5, sm: 2 },
                                        px: { xs: 0.5, sm: 2 },
                                        verticalAlign: "top",
                                      }}
                                    >
                                      <TextField
                                        size="small"
                                        placeholder="0"
                                        value={currentEntry?.actualValue || ""}
                                        onChange={(e) =>
                                          handleDataInput(
                                            indicator.id,
                                            period.period_id,
                                            e.target.value
                                          )
                                        }
                                        sx={{
                                          width: { xs: "80px", sm: "100px" },
                                          "& .MuiOutlinedInput-root": {
                                            height: { xs: "32px", sm: "36px" },
                                            fontSize: {
                                              xs: "0.75rem",
                                              sm: "0.875rem",
                                            },
                                            backgroundColor:
                                              urgency === "overdue"
                                                ? "#fef2f2"
                                                : urgency === "due-soon"
                                                ? "#fef3c7"
                                                : "transparent",
                                          },
                                        }}
                                        type="number"
                                        inputProps={{
                                          min: 0,
                                          step: "any",
                                        }}
                                      />
                                    </TableCell>
                                  );
                                })}

                                {/* Total column */}
                                <TableCell
                                  sx={{
                                    textAlign: "center",
                                    py: { xs: 1.5, sm: 2 },
                                    px: { xs: 0.5, sm: 2 },
                                    fontWeight: "600",
                                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                    color: getTotalColor(
                                      calculateIndicatorTotal(indicator.id),
                                      indicator.target_value || 0
                                    ),
                                    verticalAlign: "top",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: { xs: "block", sm: "inline" },
                                    }}
                                  >
                                    {calculateIndicatorTotal(
                                      indicator.id
                                    ).toLocaleString()}{" "}
                                    / {indicator.target_value?.toLocaleString()}
                                  </Box>
                                </TableCell>
                              </TableRow>

                              {/* Sub-indicator rows */}
                              {indicator.sub_indicators?.length > 0 &&
                                expanded.has(indicator.id) && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={3 + group.relevantPeriods.length}
                                      sx={{
                                        p: 0,
                                        border: "none",
                                      }}
                                    >
                                      <Collapse in={expanded.has(indicator.id)}>
                                        <Box
                                          sx={{
                                            margin: 2,
                                            pl: 5,
                                          }}
                                        >
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                <TableCell
                                                  sx={{
                                                    py: 2,
                                                    color: "#1e293b",
                                                    fontWeight: "550",
                                                    borderBottom: "none",
                                                    width: "60px",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  ลำดับ
                                                </TableCell>
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
                                                {group.relevantPeriods.map(
                                                  (period) => (
                                                    <TableCell
                                                      key={period.period_id}
                                                      sx={{
                                                        py: 2,
                                                        color: "#1e293b",
                                                        fontWeight: "550",
                                                        borderBottom: "none",
                                                        textAlign: "center",
                                                        minWidth: "120px",
                                                      }}
                                                    >
                                                      {period.name}
                                                    </TableCell>
                                                  )
                                                )}
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {indicator.sub_indicators.map(
                                                (subIndicator, subIndex) => (
                                                  <TableRow
                                                    key={subIndicator.id}
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
                                                    {/* Sub-indicator number */}
                                                    <TableCell
                                                      sx={{
                                                        width: "60px",
                                                        textAlign: "center",
                                                        color: "#64748b",
                                                        fontSize: "0.8rem",
                                                        border: "none",
                                                        py: 2,
                                                      }}
                                                    >
                                                      {index + 1}.{subIndex + 1}
                                                    </TableCell>

                                                    {/* Sub-indicator name */}
                                                    <TableCell
                                                      sx={{
                                                        minWidth: "300px",
                                                        color: "#475569",
                                                        fontSize: "0.85rem",
                                                        pl: 4,
                                                        border: "none",
                                                        py: 2,
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      {subIndicator.name}
                                                      <Typography
                                                        sx={{
                                                          fontSize: "0.7rem",
                                                          color: "#94a3b8",
                                                          mt: 0.25,
                                                        }}
                                                      >
                                                        เป้าหมาย:{" "}
                                                        {
                                                          subIndicator.target_value
                                                        }
                                                      </Typography>
                                                    </TableCell>

                                                    {/* Period input boxes for sub-indicators - only relevant periods */}
                                                    {group.relevantPeriods.map(
                                                      (period) => {
                                                        const subDataKey =
                                                          getDataEntryKey(
                                                            subIndicator.id,
                                                            period.period_id
                                                          );
                                                        const subCurrentEntry =
                                                          dataEntries.get(
                                                            subDataKey
                                                          );
                                                        const urgency =
                                                          getPeriodUrgency(
                                                            period
                                                          );

                                                        return (
                                                          <TableCell
                                                            key={
                                                              period.period_id
                                                            }
                                                            sx={{
                                                              textAlign:
                                                                "center",
                                                              minWidth: "150px",
                                                              border: "none",
                                                              py: 2,
                                                            }}
                                                          >
                                                            <TextField
                                                              size="small"
                                                              placeholder="0"
                                                              value={
                                                                subCurrentEntry?.actualValue ||
                                                                ""
                                                              }
                                                              onChange={(e) =>
                                                                handleDataInput(
                                                                  subIndicator.id,
                                                                  period.period_id,
                                                                  e.target.value
                                                                )
                                                              }
                                                              sx={{
                                                                width: "90px",
                                                                "& .MuiOutlinedInput-root":
                                                                  {
                                                                    height:
                                                                      "32px",
                                                                    fontSize:
                                                                      "0.8rem",
                                                                    backgroundColor:
                                                                      urgency ===
                                                                      "overdue"
                                                                        ? "#fef2f2"
                                                                        : urgency ===
                                                                          "due-soon"
                                                                        ? "#fef3c7"
                                                                        : "transparent",
                                                                  },
                                                              }}
                                                              type="number"
                                                              inputProps={{
                                                                min: 0,
                                                                step: "any",
                                                              }}
                                                            />
                                                          </TableCell>
                                                        );
                                                      }
                                                    )}
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
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            ));
          })()}
        </CardContent>
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
