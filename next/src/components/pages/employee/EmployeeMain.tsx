"use client";

import { Department, Employee } from "@/types/employee";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import EmployeeTableSection from "./EmployeeTableSection";

export default function EmployeeMain() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
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

    const loadDepartments = async () => {
        try {
            const response = await fetch("/api/departments");

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch departments: ${response.status}`
                );
            }

            const departmentData = await response.json();
            setDepartments(departmentData);
        } catch (err) {
            console.error("Error loading departments:", err);
        }
    };

    const handleRefresh = () => {
        loadEmployees();
        loadDepartments();
    };

    useEffect(() => {
        loadEmployees();
        loadDepartments();
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
                departments={departments}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
            />
        </Box>
    );
}
