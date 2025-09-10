"use client";

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ManagementTable from "./ManagementTable";
import { Indicator, Category } from "@/types/management";
import Header from "@/components/header";

export default function ManagementMain() {
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get("categoryId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลด category list
  const loadCategories = async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      // เอาไว้ debug
      console.log("Categories:", data);
      setCategories(data);

      // ตั้งค่า default catId - ใช้จาก URL parameter ก่อน หรือ category แรกถ้าไม่มี
      if (
        categoryIdFromUrl &&
        data.some((cat) => cat.id === categoryIdFromUrl)
      ) {
        setSelectedCatId(categoryIdFromUrl);
      } else if (data.length > 0 && !selectedCatId) {
        setSelectedCatId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  };

  // โหลด indicators จาก API route
  const loadIndicators = async (catId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/category-indicators/${catId}`);
      if (!res.ok) throw new Error("Failed to fetch KPIs");

      const data: Indicator[] = await res.json();
      // เอาไว้ debug
      console.log("Indicators:", data);
      setIndicators(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error loading indicators:", err);
    } finally {
      setLoading(false);
    }
  };

  // เมื่อ component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // เมื่อ selectedCatId เปลี่ยน
  useEffect(() => {
    if (selectedCatId) loadIndicators(selectedCatId);
  }, [selectedCatId]);

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f8fafc",
        flexGrow: 1,
      }}
    >
      {/* Dropdown เลือก category */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="category-select-label">หมวดหมู่</InputLabel>
        <Select
          labelId="category-select-label"
          value={selectedCatId}
          label="Category"
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Table แสดง KPI ของ category */}
      <ManagementTable
        indicators={indicators}
        loading={loading}
        error={error}
        onRefresh={() => loadIndicators(selectedCatId)}
      />
    </Box>
  );
}
