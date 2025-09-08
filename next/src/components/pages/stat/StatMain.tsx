"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";

import { Category } from "@/types/category";

export default function StatMain() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                minHeight: "100%",
                width: "100%",
            }}
        >
            "YOYOYO"
        </Box>
    );
}
