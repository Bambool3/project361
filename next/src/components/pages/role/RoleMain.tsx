"use client";

import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import RoleTableSection from "./RoleTableSection";
import { Role } from "@/types/role";

export default function RoleMain() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/role");

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const roleData = await response.json();

      const transformedRoles = roleData.map((item: any) => ({
        id: item.id,
        name: item.role_name,
        employeeCount: item.employeeCount,
      }));
      setRoles(transformedRoles);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error loading roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRoles();
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <Box
      sx={{
        px: 9,
        py: 3,
        backgroundColor: "#f8fafc",
        minHeight: "100%",
        width: "100%",
      }}
    >
      <RoleTableSection
        roles={roles}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
      />
    </Box>
  );
}
