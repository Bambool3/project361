"use client";

import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Tags,
} from "lucide-react";

interface DashboardStatProps {
    stats: {
        totalKPIs: number;
        totalCategories: number;
    };
    loading: boolean;
}

export default function DashboardStat({ stats, loading }: DashboardStatProps) {
    const kpiStats = [
        {
            title: "หมวดหมู่ทั้งหมด",
            value: stats?.totalCategories?.toString() || "0",
            icon: Tags,
            color: "#8b5cf6",
            bgColor: "#f3f4f6",
        },
        {
            title: "ตัวชี้วัดทั้งหมด",
            value: stats?.totalKPIs?.toString() || "0",
            icon: BarChart3,
            color: "#8b5cf6",
            bgColor: "#f8fafc",
        },
        {
            title: "กำลังดำเนินการ",
            value: "?",
            percentage: "12.5%",
            icon: TrendingUp,
            color: "#3b82f6",
            bgColor: "#eff6ff",
        },
        {
            title: "เสร็จสิ้น",
            value: "?",
            percentage: "75%",
            icon: CheckCircle,
            color: "#10b981",
            bgColor: "#f0fdf4",
        },
    ];

    if (loading) {
        return (
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "1fr 1fr 1fr 1fr",
                    },
                    gap: 3,
                    mb: 4,
                }}
            >
                {[1, 2, 3, 4].map((index) => (
                    <Card
                        key={index}
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" height={40} />
                            <Skeleton variant="text" width="30%" />
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr 1fr",
                },
                gap: 3,
                mb: 4,
            }}
        >
            {kpiStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <Card
                        key={index}
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transition: "all 0.2s",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {stat.title}
                                </Typography>
                                <Box
                                    sx={{
                                        p: 1,
                                        borderRadius: "12px",
                                        backgroundColor: stat.bgColor,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <IconComponent
                                        size={20}
                                        color={stat.color}
                                    />
                                </Box>
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                    mb: 1,
                                }}
                            >
                                {stat.value}
                            </Typography>
                            {stat.percentage && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#64748b",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {stat.percentage}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}
