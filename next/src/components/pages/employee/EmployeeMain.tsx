"use client";

import { JobTitle, Employee } from "@/types/employee";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import EmployeeTableSection from "./EmployeeTableSection";

export default function EmployeeMain() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/employee");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch employees: ${response.status}`
                );
            }

            const employeeData = await response.json();
            setEmployees(employeeData);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            setError(errorMessage);
            console.error("Error loading employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadJobTitles = async () => {
        try {
            const response = await fetch("/api/jobTitle");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch job titles: ${response.status}`
                );
            }

            const data = await response.json();
            const transformedJobTitles = data.map((item: any) => ({
                id: item.id,
                name: item.jobTitle_name,
            }));
            setJobTitles(transformedJobTitles);
        } catch (err) {
            console.error("Error loading job titles:", err);
        }
    };

    const handleRefresh = () => {
        loadEmployees();
        loadJobTitles();
    };

    useEffect(() => {
        loadEmployees();
        loadJobTitles();
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
            <EmployeeTableSection
                employees={employees}
                jobTitles={jobTitles}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
            />
        </Box>
    );
}
