"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton,
    Alert,
    Card,
    CardContent,
    Divider,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Frequency,
    FrequencyFormData,
    FrequencyPeriod,
} from "@/types/frequency";

interface FrequencyAddEditProps {
    frequency?: Frequency | null;
    onSubmit: (data: FrequencyFormData) => void;
    onCancel: () => void;
}

// Validation schema
const frequencySchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อความถี่"),
    type: z.enum(["standard", "custom"]).refine((val) => val, {
        message: "กรุณาเลือกประเภทความถี่",
    }),
    periods: z
        .array(
            z.object({
                startDate: z.date({
                    message: "กรุณาเลือกวันที่เริ่มต้น",
                }),
                endDate: z.date({
                    message: "กรุณาเลือกวันที่สิ้นสุด",
                }),
            })
        )
        .min(1, "กรุณาเพิ่มอย่างน้อย 1 ช่วงเวลา")
        .refine(
            (periods) => {
                // Check if end date is after start date for each period
                return periods.every(
                    (period) => period.endDate >= period.startDate
                );
            },
            {
                message: "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น",
            }
        )
        .refine(
            (periods) => {
                // Check for overlapping periods
                if (periods.length <= 1) return true;

                const sortedPeriods = [...periods].sort(
                    (a, b) =>
                        new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime()
                );

                for (let i = 0; i < sortedPeriods.length - 1; i++) {
                    const current = sortedPeriods[i];
                    const next = sortedPeriods[i + 1];

                    if (new Date(current.endDate) >= new Date(next.startDate)) {
                        return false;
                    }
                }
                return true;
            },
            {
                message: "ช่วงเวลาต้องไม่ซ้อนทับกัน",
            }
        ),
});

export default function FrequencyAddEdit({
    frequency,
    onSubmit,
    onCancel,
}: FrequencyAddEditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStandardType, setSelectedStandardType] =
        useState<string>("");

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        reset,
    } = useForm<FrequencyFormData>({
        resolver: zodResolver(frequencySchema),
        defaultValues: {
            name: "",
            type: "standard",
            periods: [
                {
                    startDate: new Date(),
                    endDate: new Date(),
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "periods",
    });

    const watchedType = watch("type");

    // Reset form when frequency prop changes
    useEffect(() => {
        if (frequency) {
            // Determine standard type for existing frequency
            let standardType = "";
            if (frequency.type === "standard") {
                if (
                    frequency.name === "รายปี" ||
                    frequency.periods.length === 1
                ) {
                    standardType = "yearly";
                } else if (
                    frequency.name === "รายเดือน" ||
                    frequency.periods.length === 12
                ) {
                    standardType = "monthly";
                }
            }
            setSelectedStandardType(standardType);

            reset({
                name: frequency.name,
                type: frequency.type,
                periods:
                    frequency.periods.length > 0
                        ? frequency.periods.map((period) => ({
                              startDate: new Date(period.startDate),
                              endDate: new Date(period.endDate),
                          }))
                        : [{ startDate: new Date(), endDate: new Date() }],
            });
        } else {
            setSelectedStandardType("");
            reset({
                name: "",
                type: "standard",
                periods: [
                    {
                        startDate: new Date(),
                        endDate: new Date(),
                    },
                ],
            });
        }
    }, [frequency, reset]);

    const handleFormSubmit = async (data: FrequencyFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addPeriod = () => {
        append({
            startDate: new Date(),
            endDate: new Date(),
        });
    };

    const removePeriod = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const setStandardPeriods = (standardType: string) => {
        const currentYear = new Date().getFullYear();
        let standardPeriods: { startDate: Date; endDate: Date }[] = [];

        if (standardType === "yearly") {
            // Set yearly periods
            standardPeriods = [
                {
                    startDate: new Date(currentYear, 0, 1), // Jan 1
                    endDate: new Date(currentYear, 11, 31), // Dec 31
                },
            ];
            setValue("name", "รายปี");
        } else if (standardType === "monthly") {
            // Set monthly periods
            standardPeriods = Array.from({ length: 12 }, (_, i) => {
                const startDate = new Date(currentYear, i, 1);
                const endDate = new Date(currentYear, i + 1, 0); // Last day of the month
                return { startDate, endDate };
            });
            setValue("name", "รายเดือน");
        }

        setValue("periods", standardPeriods);
    };

    const handleStandardTypeChange = (event: any) => {
        const standardType = event.target.value;
        setSelectedStandardType(standardType);
        if (standardType) {
            setStandardPeriods(standardType);
        }
    };

    // Auto-set standard periods when type changes to standard
    useEffect(() => {
        if (watchedType === "standard" && !frequency && selectedStandardType) {
            setStandardPeriods(selectedStandardType);
        }
    }, [watchedType, frequency, selectedStandardType, setValue]);

    const formatDateForInput = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const parseDateFromInput = (dateString: string) => {
        return new Date(dateString);
    };

    return (
        <Box sx={{ backgroundColor: "white", p: 0 }}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <Box sx={{ p: 3 }}>
                    {/* Frequency Name */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            component="label"
                            sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1.5,
                            }}
                        >
                            ชื่อความถี่{" "}
                            <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    placeholder="กรอกชื่อความถี่"
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "white",
                                            borderRadius: "12px",
                                            "&:hover fieldset": {
                                                borderColor: "#8b5cf6",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#8b5cf6",
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Frequency Type */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            component="label"
                            sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1.5,
                            }}
                        >
                            ประเภทความถี่{" "}
                            <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        {...field}
                                        row
                                        sx={{
                                            gap: 3,
                                        }}
                                    >
                                        <FormControlLabel
                                            value="standard"
                                            control={
                                                <Radio
                                                    sx={{
                                                        "&.Mui-checked": {
                                                            color: "#8b5cf6",
                                                        },
                                                    }}
                                                />
                                            }
                                            label="มาตรฐาน"
                                            sx={{
                                                "& .MuiFormControlLabel-label":
                                                    {
                                                        fontSize: "0.875rem",
                                                        color: "#374151",
                                                    },
                                            }}
                                        />
                                        <FormControlLabel
                                            value="custom"
                                            control={
                                                <Radio
                                                    sx={{
                                                        "&.Mui-checked": {
                                                            color: "#8b5cf6",
                                                        },
                                                    }}
                                                />
                                            }
                                            label="กำหนดเอง"
                                            sx={{
                                                "& .MuiFormControlLabel-label":
                                                    {
                                                        fontSize: "0.875rem",
                                                        color: "#374151",
                                                    },
                                            }}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            )}
                        />
                        {errors.type && (
                            <Typography
                                color="error"
                                sx={{ fontSize: "0.75rem", mt: 0.5 }}
                            >
                                {errors.type.message}
                            </Typography>
                        )}
                    </Box>

                    {/* Standard Frequency Type Selector */}
                    {watchedType === "standard" && (
                        <Box sx={{ mb: 3 }}>
                            <Typography
                                component="label"
                                sx={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: "600",
                                    color: "#374151",
                                    mb: 1.5,
                                }}
                            >
                                เลือกประเภทมาตรฐาน{" "}
                                <span style={{ color: "#ef4444" }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel id="standard-type-select-label">
                                    เลือกประเภทความถี่มาตรฐาน
                                </InputLabel>
                                <Select
                                    labelId="standard-type-select-label"
                                    value={selectedStandardType}
                                    label="เลือกประเภทความถี่มาตรฐาน"
                                    onChange={handleStandardTypeChange}
                                    sx={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
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
                                    <MenuItem value="">
                                        <em>กรุณาเลือกประเภทความถี่</em>
                                    </MenuItem>
                                    <MenuItem value="yearly">
                                        รายปี (1 มกราคม - 31 ธันวาคม)
                                    </MenuItem>
                                    <MenuItem value="monthly">
                                        รายเดือน (แต่ละเดือนของปี)
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* Periods */}
                    <Box sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2,
                            }}
                        >
                            <Typography
                                component="label"
                                sx={{
                                    fontSize: "0.875rem",
                                    fontWeight: "600",
                                    color: "#374151",
                                }}
                            >
                                ช่วงเวลา{" "}
                                <span style={{ color: "#ef4444" }}>*</span>
                            </Typography>
                            {watchedType === "custom" && (
                                <Button
                                    onClick={addPeriod}
                                    startIcon={<Plus size={16} />}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#8b5cf6",
                                        color: "white",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: "8px",
                                        "&:hover": {
                                            backgroundColor: "#7c3aed",
                                        },
                                    }}
                                >
                                    เพิ่มช่วงเวลา
                                </Button>
                            )}
                        </Box>

                        {watchedType === "standard" && (
                            <Alert
                                severity="info"
                                sx={{
                                    mb: 2,
                                    borderRadius: "12px",
                                    backgroundColor: "#eff6ff",
                                    border: "1px solid #dbeafe",
                                }}
                            >
                                {selectedStandardType === "yearly" &&
                                    "ความถี่รายปี จะใช้ช่วงเวลา 1 มกราคม - 31 ธันวาคม"}
                                {selectedStandardType === "monthly" &&
                                    "ความถี่รายเดือน จะแบ่งเป็น 12 ช่วงเวลา (แต่ละเดือนของปี)"}
                                {!selectedStandardType &&
                                    "กรุณาเลือกประเภทความถี่มาตรฐานก่อน"}
                            </Alert>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            {fields.map((field, index) => (
                                <Card
                                    key={field.id}
                                    sx={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mb: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Calendar
                                                    size={18}
                                                    color="#8b5cf6"
                                                />
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: "600",
                                                        color: "#374151",
                                                    }}
                                                >
                                                    ช่วงเวลาที่ {index + 1}
                                                </Typography>
                                            </Box>
                                            {watchedType === "custom" &&
                                                fields.length > 1 && (
                                                    <IconButton
                                                        onClick={() =>
                                                            removePeriod(index)
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
                                                )}
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: {
                                                    xs: "1fr",
                                                    sm: "1fr 1fr",
                                                },
                                                gap: 2,
                                            }}
                                        >
                                            {/* Start Date */}
                                            <Box>
                                                <Typography
                                                    component="label"
                                                    sx={{
                                                        display: "block",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600",
                                                        color: "#6b7280",
                                                        mb: 1,
                                                    }}
                                                >
                                                    วันที่เริ่มต้น
                                                </Typography>
                                                <Controller
                                                    name={`periods.${index}.startDate`}
                                                    control={control}
                                                    render={({
                                                        field: dateField,
                                                    }) => (
                                                        <TextField
                                                            type="date"
                                                            size="small"
                                                            fullWidth
                                                            disabled={
                                                                watchedType ===
                                                                "standard"
                                                            }
                                                            value={formatDateForInput(
                                                                dateField.value
                                                            )}
                                                            onChange={(e) => {
                                                                const newDate =
                                                                    parseDateFromInput(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                dateField.onChange(
                                                                    newDate
                                                                );
                                                            }}
                                                            error={
                                                                !!errors
                                                                    .periods?.[
                                                                    index
                                                                ]?.startDate
                                                            }
                                                            helperText={
                                                                errors
                                                                    .periods?.[
                                                                    index
                                                                ]?.startDate
                                                                    ?.message
                                                            }
                                                            sx={{
                                                                "& .MuiOutlinedInput-root":
                                                                    {
                                                                        backgroundColor:
                                                                            watchedType ===
                                                                            "standard"
                                                                                ? "#f9fafb"
                                                                                : "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                        "&:hover fieldset":
                                                                            {
                                                                                borderColor:
                                                                                    "#8b5cf6",
                                                                            },
                                                                        "&.Mui-focused fieldset":
                                                                            {
                                                                                borderColor:
                                                                                    "#8b5cf6",
                                                                            },
                                                                    },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>

                                            {/* End Date */}
                                            <Box>
                                                <Typography
                                                    component="label"
                                                    sx={{
                                                        display: "block",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600",
                                                        color: "#6b7280",
                                                        mb: 1,
                                                    }}
                                                >
                                                    วันที่สิ้นสุด
                                                </Typography>
                                                <Controller
                                                    name={`periods.${index}.endDate`}
                                                    control={control}
                                                    render={({
                                                        field: dateField,
                                                    }) => (
                                                        <TextField
                                                            type="date"
                                                            size="small"
                                                            fullWidth
                                                            disabled={
                                                                watchedType ===
                                                                "standard"
                                                            }
                                                            value={formatDateForInput(
                                                                dateField.value
                                                            )}
                                                            onChange={(e) => {
                                                                const newDate =
                                                                    parseDateFromInput(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                dateField.onChange(
                                                                    newDate
                                                                );
                                                            }}
                                                            error={
                                                                !!errors
                                                                    .periods?.[
                                                                    index
                                                                ]?.endDate
                                                            }
                                                            helperText={
                                                                errors
                                                                    .periods?.[
                                                                    index
                                                                ]?.endDate
                                                                    ?.message
                                                            }
                                                            sx={{
                                                                "& .MuiOutlinedInput-root":
                                                                    {
                                                                        backgroundColor:
                                                                            watchedType ===
                                                                            "standard"
                                                                                ? "#f9fafb"
                                                                                : "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                        "&:hover fieldset":
                                                                            {
                                                                                borderColor:
                                                                                    "#8b5cf6",
                                                                            },
                                                                        "&.Mui-focused fieldset":
                                                                            {
                                                                                borderColor:
                                                                                    "#8b5cf6",
                                                                            },
                                                                    },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {errors.periods && (
                            <Typography
                                color="error"
                                sx={{ fontSize: "0.75rem", mt: 1 }}
                            >
                                {errors.periods.message}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Divider />

                {/* Form Actions */}
                <Box
                    sx={{
                        p: 3,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        backgroundColor: "white",
                    }}
                >
                    <Button
                        onClick={onCancel}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderRadius: "12px",
                            borderColor: "#d1d5db",
                            color: "#6b7280",
                            "&:hover": {
                                borderColor: "#9ca3af",
                                backgroundColor: "#f9fafb",
                            },
                        }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        sx={{
                            backgroundColor: "#8b5cf6",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            borderRadius: "12px",
                            "&:hover": {
                                backgroundColor: "#7c3aed",
                            },
                            "&:disabled": {
                                backgroundColor: "#d1d5db",
                            },
                        }}
                    >
                        {isSubmitting
                            ? "กำลังบันทึก..."
                            : frequency
                            ? "บันทึกการแก้ไข"
                            : "เพิ่มความถี่"}
                    </Button>
                </Box>
            </form>
        </Box>
    );
}
