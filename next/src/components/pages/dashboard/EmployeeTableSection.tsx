"use client";

import { Category } from "@/types/category";
import { useRouter } from "next/navigation";
import { Box, Typography, Chip } from "@mui/material";
import { Tags } from "lucide-react";
import CustomTable from "@/components/ui/custom-table";

interface EmployeeTableSectionProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function EmployeeTableSection({
  categories,
  loading,
  error,
  onRefresh,
}: EmployeeTableSectionProps) {
  const router = useRouter();

  const handleRowClick = (category: Category) => {
    router.push(`/employee/data?categoryId=${category.id}`);
  };

  const columns = [
    {
      id: "name",
      label: "ชื่อหมวดหมู่",
      searchable: true,
      render: (category: Category, index: number) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: "#8b5cf6",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
            }}
          >
            {index + 1}
          </Box>
          <Typography
            sx={{
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {category.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: "description",
      label: "รายละเอียด",
      searchable: true,
      render: (category: Category) => (
        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          {category.description}
        </Typography>
      ),
    },
    {
      id: "indicators",
      label: "จำนวนตัวชี้วัด",
      align: "center" as const,
      render: (category: Category) => (
        <Chip
          label={`${category.indicators?.length || 0} ตัวชี้วัด`}
          size="small"
          sx={{
            backgroundColor: "#f1f5f9",
            color: "#475569",
            fontWeight: "600",
          }}
        />
      ),
    },
    {
      id: "created_at",
      label: "วันที่สร้าง",
      align: "center" as const,
      render: (category: Category) => (
        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          {new Date(category.created_at).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Typography>
      ),
    },
  ];

  return (
    <CustomTable
      data={categories}
      columns={columns}
      loading={loading}
      error={error}
      title="รายการหมวดหมู่ที่ท่านรับผิดชอบ"
      icon={<Tags size={24} color="#8b5cf6" />}
      searchPlaceholder="ค้นหาหมวดหมู่..."
      onRowClick={handleRowClick}
      onRefresh={onRefresh}
      emptyMessage="ไม่มีข้อมูลหมวดหมู่"
      searchableFields={["name", "description"]}
    />
  );
}
