"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
} from "@mui/material";
import { Calendar, Trash2 } from "lucide-react";
import {
    formatDateForInput,
    parseDateInputToBangkok,
    normalizeToBangkokMidnight,
    isDateAfter,
    isSameDay,
    compareDateOnly,
} from "@/lib/dateUtils";
import { Frequency, FrequencyFormData } from "@/types/frequency";

// Validation schema
const frequencySchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อความถี่"),
    periods_in_year: z
        .number()
        .min(1, "กรุณาระบุจำนวนช่วงอย่างน้อย 1")
        .max(12, "จำนวนช่วงต้องไม่เกิน 12"),
    periods: z
        .array(
            z
                .object({
                    name: z.string().min(1, "กรุณากรอกชื่อช่วงเวลา"),
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

interface FrequencyAddEditV2Props {
    frequency?: Frequency | null;
    onSubmit: (data: FrequencyFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export default function FrequencyAddEditV2({
    frequency,
    onSubmit,
    onCancel,
    loading: externalLoading = false,
}: FrequencyAddEditV2Props) {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = externalLoading || submitLoading;
    const isEditMode = !!frequency;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(frequencySchema),
        defaultValues: {
            name: "",
            periods_in_year: 1,
            periods: [
                {
                    name: "",
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
            const periodsInYear = frequency.periods?.length || 1;
            reset({
                name: frequency.name,
                periods_in_year: periodsInYear,
                periods:
                    frequency.periods?.length > 0
                        ? frequency.periods.map((period: any) => ({
                              name: period.name || "",
                              startDate: new Date(
                                  period.start_date || period.startDate
                              ),
                              endDate: new Date(
                                  period.end_date || period.endDate
                              ),
                          }))
                        : [
                              {
                                  name: "",
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
                periods_in_year: 1,
                periods: [
                    {
                        name: "",
                        startDate: normalizeToBangkokMidnight(new Date()),
                        endDate: normalizeToBangkokMidnight(new Date()),
                    },
                ],
            });
        }
    }, [frequency, reset]);

    const periods_in_year = watch("periods_in_year");
    const periods = watch("periods");

    const handlePeriodsInYearChange = (value: number) => {
        if (isNaN(value) || value < 1) return;

        setValue("periods_in_year", value);
        const currentPeriods = [...periods];

        if (value > currentPeriods.length) {
            for (let i = currentPeriods.length; i < value; i++) {
                append({
                    name: "",
                    startDate: normalizeToBangkokMidnight(new Date()),
                    endDate: normalizeToBangkokMidnight(new Date()),
                });
            }
        } else if (value < currentPeriods.length) {
            for (let i = currentPeriods.length - 1; i >= value; i--) {
                remove(i);
            }
        }
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

    const checkPeriodOverlaps = (
        periods: { name: string; startDate: Date; endDate: Date }[]
    ) => {
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
                const currentPeriod = sortedPeriods[i];
                const nextPeriod = sortedPeriods[i + 1];
                const currentStart =
                    currentPeriod.startDate.toLocaleDateString("th-TH");
                const currentEnd =
                    currentPeriod.endDate.toLocaleDateString("th-TH");
                const nextStart =
                    nextPeriod.startDate.toLocaleDateString("th-TH");
                const nextEnd = nextPeriod.endDate.toLocaleDateString("th-TH");

                const currentName = currentPeriod.name || `ช่วงที่ ${i + 1}`;
                const nextName = nextPeriod.name || `ช่วงที่ ${i + 2}`;

                setSubmitError(
                    `ช่วงเวลาซ้อนทับกัน: "${currentName} (${currentStart} - ${currentEnd})" กับ "${nextName} (${nextStart} - ${nextEnd})" กรุณาตรวจสอบวันที่ให้ถูกต้อง`
                );
                return false;
            }
        }
        return true;
    };

    const handleFormSubmit = async (data: FormData) => {
        if (!checkPeriodOverlaps(data.periods)) {
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitError(null);

            const formattedData: FrequencyFormData = {
                name: data.name,
                periods: data.periods,
                periods_in_year: data.periods_in_year,
            };

            await onSubmit(formattedData);
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

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            sx={{ width: "100%", p: 3 }}
        >
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 120px",
                        },
                        gap: 2,
                    }}
                >
                    {/* Name Input */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "600", color: "#374151", mb: 1 }}
                        >
                            ชื่อความถี่ *
                        </Typography>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "กรุณาระบุชื่อความถี่" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    placeholder="กรุณาระบุชื่อความถี่"
                                    disabled={isLoading}
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

                    {/* Periods in Year Input */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: "600",
                                color: "#374151",
                                mb: 1,
                            }}
                        >
                            จำนวนช่วงต่อปี *
                        </Typography>
                        <Controller
                            name="periods_in_year"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    inputProps={{ min: 1, max: 12, step: 1 }}
                                    fullWidth
                                    error={!!errors.periods_in_year}
                                    helperText={errors.periods_in_year?.message}
                                    disabled={isLoading}
                                    placeholder="1-12"
                                    value={field.value}
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        if (inputValue === "") {
                                            field.onChange("");
                                            return;
                                        }

                                        inputValue = inputValue.replace(
                                            /^0+/,
                                            ""
                                        );

                                        let numValue = Number(inputValue);

                                        if (
                                            !isNaN(numValue) &&
                                            numValue >= 1 &&
                                            numValue <= 12
                                        ) {
                                            field.onChange(numValue);
                                            handlePeriodsInYearChange(numValue);
                                        } else if (
                                            !isNaN(numValue) &&
                                            numValue > 12
                                        ) {
                                            field.onChange(12);
                                            handlePeriodsInYearChange(12);
                                        } else if (
                                            !isNaN(numValue) &&
                                            numValue < 1
                                        ) {
                                            field.onChange(1);
                                            handlePeriodsInYearChange(1);
                                        }

                                        setSubmitError(null);
                                    }}
                                    onBlur={(e) => {
                                        if (
                                            e.target.value === "" ||
                                            Number(e.target.value) < 1
                                        ) {
                                            field.onChange(1);
                                            handlePeriodsInYearChange(1);
                                        }
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
                </Box>
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
                            </Box>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: 2,
                                    mb: 2,
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
                                        ชื่อช่วงเวลา *
                                    </Typography>
                                    <Controller
                                        name={`periods.${index}.name` as const}
                                        control={control}
                                        render={({ field: nameField }) => (
                                            <TextField
                                                size="small"
                                                fullWidth
                                                disabled={isLoading}
                                                placeholder="เช่น ไตรมาสที่ 1, มกราคม 2567, ปีการศึกษา 2567"
                                                value={nameField.value}
                                                onChange={(e) => {
                                                    nameField.onChange(
                                                        e.target.value
                                                    );
                                                    setSubmitError(null);
                                                }}
                                                error={
                                                    !!errors.periods?.[index]
                                                        ?.name
                                                }
                                                helperText={
                                                    errors.periods?.[index]
                                                        ?.name?.message
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
                                        name={
                                            `periods.${index}.startDate` as const
                                        }
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
                                        name={
                                            `periods.${index}.endDate` as const
                                        }
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
