"use client";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
    Tooltip,
} from "@mui/material";
import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Tags,
} from "lucide-react";

interface DashboardStatCardSectionProps {
    stats: {
        totalKPIs: number;
        totalCategories: number;
    };
    loading: boolean;
}

export default function DashboardStatCardSection({
    stats,
    loading,
}: DashboardStatCardSectionProps) {
    const kpiStats = [
        {
            title: "ตัวชี้วัดทั้งหมด",
            value: stats?.totalKPIs?.toString() || "0",
            icon: BarChart3,
            color: "#0ea5e9",
            bgColor: "#f0f9ff",
            tooltip: `จำนวนตัวชี้วัดทั้งหมดในระบบ: ${
                stats?.totalKPIs || 0
            } รายการ`,
        },
        {
            title: "กำลังดำเนินการ",
            value: "12",
            percentage: "12.5%",
            icon: TrendingUp,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            tooltip: "ตัวชี้วัดที่อยู่ระหว่างการดำเนินการและยังไม่เสร็จสิ้น",
        },
        {
            title: "เสร็จสิ้น",
            value: "85",
            percentage: "75%",
            icon: CheckCircle,
            color: "#10b981",
            bgColor: "#f0fdf4",
            tooltip: "ตัวชี้วัดที่ดำเนินการเสร็จสิ้นแล้วและบรรลุเป้าหมาย",
        },
        {
            title: "เกินกำหนด",
            value: "3",
            percentage: "2.5%",
            icon: AlertTriangle,
            color: "#ef4444",
            bgColor: "#fef2f2",
            tooltip:
                "ตัวชี้วัดที่เกินกำหนดเวลาที่กำหนดไว้ - ต้องการความสนใจเป็นพิเศษ",
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
                    <Tooltip
                        key={index}
                        title={
                            <Box sx={{ p: 1 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                    {stat.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                                >
                                    {stat.tooltip}
                                </Typography>
                                {stat.percentage && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block",
                                            mt: 0.5,
                                            color: "rgba(255, 255, 255, 0.8)",
                                        }}
                                    >
                                        คิดเป็น {stat.percentage} ของทั้งหมด
                                    </Typography>
                                )}
                            </Box>
                        }
                        arrow
                        placement="top"
                        enterDelay={300}
                        leaveDelay={200}
                        slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: "offset",
                                        options: {
                                            offset: [0, -8],
                                        },
                                    },
                                ],
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: stat.color,
                                    fontSize: "0.875rem",
                                    borderRadius: 2,
                                    boxShadow: `0 4px 20px ${stat.color}40`,
                                    maxWidth: 280,
                                    "& .MuiTooltip-arrow": {
                                        color: stat.color,
                                    },
                                },
                            },
                        }}
                    >
                        <Card
                            sx={{
                                backgroundColor: "white",
                                borderRadius: "16px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                transition: "all 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 4px 20px ${stat.color}20`,
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
                    </Tooltip>
                );
            })}
        </Box>
    );
}
