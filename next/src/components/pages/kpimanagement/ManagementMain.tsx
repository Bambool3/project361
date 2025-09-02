"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import ManagementTable from "./ManagementTable";
// import ManagementCat from "./ManagementCat";
import { Indicator } from "@/types/dashboard";

export default function ManagementMain() {
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadIndicators  = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/indicator");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch indicators: ${response.status}`
                );
            }

            const indicatorsData = await response.json();
            setIndicators(indicatorsData);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            console.error("Error loading indicators:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIndicators();
    }, []);

    return (
        <Box
            sx={{
                px: "80px",
                py: "25px",
                backgroundColor: "#f8fafc",
                flexGrow: 1
            }}
        >

            {/* <ManagementCat/> */}

            {/* Lower Section - Table */}
            <ManagementTable
                indicators={indicators} // ส่ง indicators ไปยัง Table
                loading={loading}
                error={error}
                onRefresh={loadIndicators}
            />
        </Box>
    );
}
