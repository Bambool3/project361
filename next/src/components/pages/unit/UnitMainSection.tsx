import { Unit } from "@/types/unit";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import UnitTableSection from "./UnitTableSection";

export default function UnitMainSection() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/unit");

      if (!response.ok) {
        throw new Error(`Failed to fetch units: ${response.status}`);
      }

      const unitData = await response.json();

      const transformedUnits = unitData.map((item: any) => ({
        id: item.unit_id,
        name: item.name,
        indicatorCount: item.indicatorCount,
      }));
      setUnits(transformedUnits);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error loading units:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUnits();
  };

  useEffect(() => {
    loadUnits();
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
      <UnitTableSection
        units={units}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
      />
    </Box>
  );
}
