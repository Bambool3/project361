"use client";

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DataTableSection from "./DataTableSection";
import { Indicator } from "@/types/management";
import { FrequencyPeriod } from "@/types/frequency";

interface Category {
    id: string;
    name: string;
    description?: string;
}

export default function DataMain() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const categoryIdFromUrl = searchParams.get("categoryId");

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string>("");
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [periods, setPeriods] = useState<FrequencyPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = async () => {
        if (!session?.user?.id) return;

        try {
            const res = await fetch(
                `/api/employee/categories?userId=${session.user.id}`
            );
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data: Category[] = await res.json();
            setCategories(data);

            if (
                categoryIdFromUrl &&
                data.some((cat) => cat.id === categoryIdFromUrl)
            ) {
                setSelectedCatId(categoryIdFromUrl);
            } else if (data.length > 0 && !selectedCatId) {
                setSelectedCatId(data[0].id);
            }
        } catch (err) {
            console.error("Error loading categories:", err);
            setError("ไม่สามารถโหลดหมวดหมู่ได้");
        }
    };

    const fetchUserIndicators = async (catId: string) => {
        if (!session?.user?.id || !catId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/employee/indicators?userId=${session.user.id}&categoryId=${catId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch indicators");
            }

            const data = await response.json();

            const transformedIndicators = data.indicators.map(
                (indicator: any) => ({
                    id: indicator.indicator_id,
                    name: indicator.name,
                    target_value: indicator.target_value,
                    unit: {
                        unit_id: indicator.unit.unit_id,
                        name: indicator.unit.name,
                    },
                    frequency: {
                        frequency_id: indicator.frequency.frequency_id,
                        name: indicator.frequency.name,
                        periods_in_year: indicator.frequency.periods_in_year,
                    },
                    responsible_jobtitles: indicator.responsible_jobtitle.map(
                        (rt: any) => ({
                            in_id: rt.indicator_id + rt.jobtitle_id,
                            id: rt.jobtitle.jobtitle_id,
                            name: rt.jobtitle.name,
                        })
                    ),
                    category_id: indicator.category_id,
                    sub_indicators:
                        indicator.sub_indicators?.map((sub: any) => ({
                            id: sub.indicator_id,
                            name: sub.name,
                            target_value: sub.target_value,
                            position: sub.position,
                        })) || [],
                })
            );

            setIndicators(transformedIndicators);

            const transformedPeriods = data.periods.map((period: any) => ({
                period_id: period.period_id,
                name: period.name,
                start_date: period.start_date,
                end_date: period.end_date,
                frequency_id: period.frequency_id,
            }));

            setPeriods(transformedPeriods);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            loadCategories();
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (selectedCatId && session?.user?.id) {
            fetchUserIndicators(selectedCatId);
        }
    }, [session?.user?.id, selectedCatId]);

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                minHeight: "100%",
                width: "100%",
            }}
        >
            {/* Category Selector */}
            <FormControl sx={{ mb: 3, minWidth: 200 }}>
                <InputLabel id="category-select-label">หมวดหมู่</InputLabel>
                <Select
                    labelId="category-select-label"
                    value={selectedCatId}
                    label="หมวดหมู่"
                    onChange={(e) => setSelectedCatId(e.target.value)}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <DataTableSection
                indicators={indicators}
                periods={periods}
                loading={loading}
                error={error}
                onRefresh={() =>
                    selectedCatId && fetchUserIndicators(selectedCatId)
                }
                categoryId={selectedCatId}
            />
        </Box>
    );
}
