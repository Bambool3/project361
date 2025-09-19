"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
// import DashboardTable from "./DashboardTableSection";

export default function DataMain() {
    // const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const catId = searchParams.get("categoryId");
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const loadIndicators = async (catId: string, userId: string) => { 
        try {
            setLoading(true);
            setError(null);

            // เพิ่ม userId เป็น query parameter ใน URL
            const response = await fetch(
                `/api/category-indicators/${catId}?userId=${userId}&filterBy=jobtitle`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch indicators for user ${userId}: ${response.status}`
                );
            }

            const indicatorData = await response.json();
            console.log(indicatorData);
            // setIndicators(indicatorData);
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
        if (userId && catId) { 
            loadIndicators(catId, userId);
        }
    }, [catId, userId]); 

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                minHeight: "100%",
                width: "100%",
            }}
        >
            {/* <DashboardTable
                indicators={indicators}
                loading={loading}
                error={error}
                onRefresh={() => {
                    if (categoryId && userId) {
                        loadIndicators(categoryId, userId);
                    }
                }}
            /> */}
        </Box>
    );
}