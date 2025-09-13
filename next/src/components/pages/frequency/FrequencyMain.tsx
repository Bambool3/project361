"use client";

import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import FrequencyTableSection from "./FrequencyTableSection";
import { Frequency } from "@/types/frequency";

export default function FrequencyMain() {
    const [frequencies, setFrequencies] = useState<Frequency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFrequencies = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/frequency");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch frequencies: ${response.status}`
                );
            }

            const frequencyData = await response.json();

            const transformedFrequencies = frequencyData.map((item: any) => ({
                frequency_id: item.frequency_id,
                name: item.name,
                type: item.type,
                periods: item.periods || [],
                indicatorCount: item.indicatorCount || 0,
                created_at: item.created_at,
                updated_at: item.updated_at,
            }));
            setFrequencies(transformedFrequencies);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            console.error("Error loading frequencies:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadFrequencies();
    };

    useEffect(() => {
        loadFrequencies();
    }, []);

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                minHeight: "100%",
                width: "100%",
            }}
        >
            <FrequencyTableSection
                frequencies={frequencies}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
            />
        </Box>
    );
}
