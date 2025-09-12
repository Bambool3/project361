"use client";

import { Job } from "@/types/job";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import JobTableSection from "./JobTableSection";

export default function JobMain() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/jobTitle");

            if (!response.ok) {
                throw new Error(`Failed to fetch jobs: ${response.status}`);
            }

            const jobData = await response.json();
            // Transform the data to match our Job interface
            const transformedJobs = jobData.map((item: any) => ({
                id: item.id,
                name: item.jobTitle_name,
                employeeCount: item.employeeCount,
            }));
            setJobs(transformedJobs);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            console.error("Error loading jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadJobs();
    };

    useEffect(() => {
        loadJobs();
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
            <JobTableSection
                jobs={jobs}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
            />
        </Box>
    );
}
