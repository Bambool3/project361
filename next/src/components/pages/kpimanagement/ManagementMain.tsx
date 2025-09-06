// "use client";

// import { Box } from "@mui/material";
// import { useState, useEffect } from "react";
// import ManagementTable from "./ManagementTable";
// // import ManagementCat from "./ManagementCat";
// import { Indicator } from "@/types/dashboard";

// export default function ManagementMain() {
//   const [indicators, setIndicators] = useState<Indicator[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadIndicators = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch("/api/indicator");

//       if (!response.ok) {
//         throw new Error(`Failed to fetch indicators: ${response.status}`);
//       }

//       const indicatorsData = await response.json();
//       setIndicators(indicatorsData);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "An unknown error occurred";
//       setError(errorMessage);
//       console.error("Error loading indicators:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadIndicators();
//   }, []);

//   return (
//     <Box
//       sx={{
//         px: "80px",
//         py: "25px",
//         backgroundColor: "#f8fafc",
//         flexGrow: 1,
//       }}
//     >
//       {/* <ManagementCat/> */}

//       {/* Lower Section - Table */}
//       <ManagementTable
//         indicators={indicators} // ส่ง indicators ไปยัง Table
//         loading={loading}
//         error={error}
//         onRefresh={loadIndicators}
//       />
//     </Box>
//   );
// }

"use client";

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import ManagementTable from "./ManagementTable";
import { Indicator, Category } from "@/types/dashboard";

export default function ManagementMain() {
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
      setCategories(data);

      // ตั้งค่า default catId ถ้ายังไม่มี
      if (data.length > 0 && !selectedCatId) setSelectedCatId(data[0].id);
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
      sx={{ px: "80px", py: "25px", backgroundColor: "#f8fafc", flexGrow: 1 }}
    >
      {/* Dropdown เลือก category */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
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
