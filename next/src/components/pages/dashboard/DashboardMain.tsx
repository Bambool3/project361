"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import DashboardStat from "./DashboardStat";
import DashboardTable from "./DashboardTable";

type Indicator = {
    id: string;
    name: string;
    unit: string;
    target_value: number;
    main_indicator_id: string;
    responsible_user_id: string;
    category_id: string;
};

type Category = {
    id: string;
    name: string;
    description: string;
    indicators: Indicator[];
};

export default function DashboardMain() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/category");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch categories: ${response.status}`
                );
            }

            const categoryData = await response.json();
            setCategories(categoryData);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            console.error("Error loading categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const stats = {
        totalKPIs: categories.reduce(
            (sum, cat) => sum + (cat.indicators?.length || 0),
            0
        ),
        totalCategories: categories.length,
    };

    return (
        <Box
            sx={{
                px: "80px",
                py: "25px",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* Upper Section - Stats Cards */}
            <DashboardStat stats={stats} loading={loading} />

            {/* Lower Section - Table */}
            <DashboardTable
                categories={categories}
                loading={loading}
                error={error}
                onRefresh={loadCategories}
            />
        </Box>
    );
}
