"use client";

import { Frequency, FrequencyFormData } from "@/types/frequency";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import {
    formatDateForInput,
    parseDateInputToBangkok,
    isDateAfter,
    isSameDay,
    compareDateOnly,
    normalizeToBangkokMidnight,
} from "@/lib/dateUtils";

const frequencySchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อความถี่"),
    periods: z
        .array(
            z
                .object({
                    startDate: z.date({ message: "กรุณาเลือกวันที่เริ่มต้น" }),
                    endDate: z.date({ message: "กรุณาเลือกวันที่สิ้นสุด" }),
                })
                .refine(
                    (period) =>
                        isDateAfter(period.endDate, period.startDate) &&
                        !isSameDay(period.startDate, period.endDate),
                    {
                        message:
                            "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น และห้ามเป็นวันเดียวกัน",
                        path: ["endDate"],
                    }
                )
        )
        .min(1, "กรุณาเพิ่มอย่างน้อย 1 ช่วงเวลา")
        .refine(
            (periods) => {
                if (periods.length <= 1) return true;
                const sortedPeriods = [...periods].sort((a, b) =>
                    compareDateOnly(a.startDate, b.startDate)
                );
                for (let i = 0; i < sortedPeriods.length - 1; i++) {
                    if (
                        compareDateOnly(
                            sortedPeriods[i].endDate,
                            sortedPeriods[i + 1].startDate
                        ) >= 0
                    ) {
                        return false;
                    }
                }
                return true;
            },
            { message: "ช่วงเวลาต้องไม่ซ้อนทับกัน" }
        ),
});

type FormData = z.infer<typeof frequencySchema>;

interface FrequencyAddEditProps {
    frequency?: Frequency | null;
    onSubmit: (data: FrequencyFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function FrequencyAddEdit({
    frequency,
    onSubmit,
    onCancel,
    loading: externalLoading = false,
}: FrequencyAddEditProps) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = externalLoading || submitLoading;
    const isEditMode = !!frequency;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(frequencySchema),
        defaultValues: {
            name: "",
            periods: [
                {
                    startDate: normalizeToBangkokMidnight(new Date()),
                    endDate: normalizeToBangkokMidnight(new Date()),
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "periods",
    });

    useEffect(() => {
        if (frequency) {
            reset({
                name: frequency.name,
                periods:
                    frequency.periods.length > 0
                        ? frequency.periods.map((period: any) => ({
                              startDate: new Date(
                                  period.start_date || period.startDate
                              ),
                              endDate: new Date(
                                  period.end_date || period.endDate
                              ),
                          }))
                        : [
                              {
                                  startDate: normalizeToBangkokMidnight(
                                      new Date()
                                  ),
                                  endDate: normalizeToBangkokMidnight(
                                      new Date()
                                  ),
                              },
                          ],
            });
        } else {
            reset({
                name: "",
                periods: [
                    {
                        startDate: normalizeToBangkokMidnight(new Date()),
                        endDate: normalizeToBangkokMidnight(new Date()),
                    },
                ],
            });
        }
    }, [frequency, reset]);

    const checkPeriodOverlaps = (
        periods: { startDate: Date; endDate: Date }[]
    ) => {
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
                const currentStart =
                    current.startDate.toLocaleDateString("th-TH");
                const currentEnd = current.endDate.toLocaleDateString("th-TH");
                const nextStart = next.startDate.toLocaleDateString("th-TH");
                const nextEnd = next.endDate.toLocaleDateString("th-TH");

                setSubmitError(
                    `ช่วงเวลาซ้อนทับกัน: "${currentStart} - ${currentEnd}" กับ "${nextStart} - ${nextEnd}" กรุณาตรวจสอบวันที่ให้ถูกต้อง`
                );
                return false;
            }
        }
        return true;
    };

    const validateDatesOnChange = () => {
        const currentValues = control._formValues;
        if (currentValues?.periods && currentValues.periods.length > 1) {
            setSubmitError(null);
            setTimeout(() => {
                checkPeriodOverlaps(currentValues.periods);
            }, 100);
        }
    };

    const handleFormSubmit = async (data: FormData) => {
        if (!checkPeriodOverlaps(data.periods)) {
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitError(null);
            await onSubmit(data);
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "เกิดข้อผิดพลาดที่ไม่คาดคิด"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        setSubmitError(null);
        onCancel();
    };

    const addPeriod = () => {
        const today = normalizeToBangkokMidnight(new Date());
        append({
            startDate: today,
            endDate: today,
        });
    };

    const removePeriod = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            sx={{ width: "100%", p: 3 }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: "600",
                        color: "#374151",
                        mb: 1,
                    }}
                >
                    ชื่อความถี่ *
                </Typography>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isLoading}
                            placeholder="กรุณาระบุชื่อความถี่"
                            onChange={(e) => {
                                field.onChange(e);
                                setSubmitError(null);
                            }}
                            sx={{
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
                        />
                    )}
                />
            </Box>

            {submitError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: "12px",
                    }}
                    onClose={() => setSubmitError(null)}
                >
                    {submitError}
                </Alert>
            )}

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
                        variant="subtitle2"
                        sx={{
                            fontWeight: "600",
                            color: "#374151",
                        }}
                    >
                        ช่วงเวลา *
                    </Typography>
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
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {fields.map((field, index) => (
                        <Box
                            key={field.id}
                            sx={{
                                p: 3,
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                backgroundColor: "#f8fafc",
                            }}
                        >
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
                                    <Calendar size={18} color="#8b5cf6" />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "600",
                                            color: "#374151",
                                        }}
                                    >
                                        ช่วงเวลาที่ {index + 1}
                                    </Typography>
                                </Box>
                                {fields.length > 1 && (
                                    <IconButton
                                        onClick={() => removePeriod(index)}
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
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
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
                                        render={({ field: dateField }) => (
                                            <TextField
                                                type="date"
                                                size="small"
                                                fullWidth
                                                disabled={isLoading}
                                                value={formatDateForInput(
                                                    dateField.value
                                                )}
                                                onChange={(e) => {
                                                    const newDate =
                                                        parseDateInputToBangkok(
                                                            e.target.value
                                                        );
                                                    dateField.onChange(newDate);
                                                    validateDatesOnChange();
                                                }}
                                                error={
                                                    !!errors.periods?.[index]
                                                        ?.startDate
                                                }
                                                helperText={
                                                    errors.periods?.[index]
                                                        ?.startDate?.message
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            backgroundColor:
                                                                "white",
                                                            borderRadius: "8px",
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

                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
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
                                        render={({ field: dateField }) => (
                                            <TextField
                                                type="date"
                                                size="small"
                                                fullWidth
                                                disabled={isLoading}
                                                value={formatDateForInput(
                                                    dateField.value
                                                )}
                                                onChange={(e) => {
                                                    const newDate =
                                                        parseDateInputToBangkok(
                                                            e.target.value
                                                        );
                                                    dateField.onChange(newDate);
                                                    validateDatesOnChange();
                                                }}
                                                error={
                                                    !!errors.periods?.[index]
                                                        ?.endDate
                                                }
                                                helperText={
                                                    errors.periods?.[index]
                                                        ?.endDate?.message
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            backgroundColor:
                                                                "white",
                                                            borderRadius: "8px",
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
                        </Box>
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

            {/* Action Buttons */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    sx={{
                        color: "#64748b",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: "12px",
                        "&:hover": {
                            backgroundColor: "#f8fafc",
                        },
                    }}
                >
                    ยกเลิก
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    variant="contained"
                    startIcon={
                        isLoading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : null
                    }
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
                            backgroundColor: "#cbd5e1",
                        },
                    }}
                >
                    {isLoading
                        ? "กำลังดำเนินการ..."
                        : isEditMode
                        ? "บันทึกการแก้ไข"
                        : "เพิ่มความถี่"}
                </Button>
            </Box>
        </Box>
    );
}
