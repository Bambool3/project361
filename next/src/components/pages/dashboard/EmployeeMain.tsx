import { Box } from "@mui/material";
import { Category } from "@/types/category";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import EmployeeTableSection from "./EmployeeTableSection";

export default function EmployeeMain() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status, update } = useSession();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Wait for session to be loaded
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        setError("User not authenticated");
        return;
      }

      if (!session?.user?.id) {
        setError("User session not found");
        return;
      }

      const response = await fetch(
        `/api/category?userId=${session.user.id}&filterBy=jobtitle`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const categoryData = await response.json();
      setCategories(categoryData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      loadCategories();
    } else if (status === "loading") {
      setLoading(true);
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("User not authenticated");
    }
  }, [status, session?.user?.id]);

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
      {/* Upper Section - Stats Cards */}
      {/* <DashboardStat stats={stats} loading={loading} /> */}

      {/* Lower Section - Table */}
      <EmployeeTableSection
        categories={categories}
        loading={loading}
        error={error}
        onRefresh={loadCategories}
      />
    </Box>
  );
}
