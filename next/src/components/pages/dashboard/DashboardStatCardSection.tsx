"use client";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
    Tooltip,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: { xs: 2, sm: 2.5, md: 3 },
                    mb: { xs: 3, sm: 4 },
                    px: { xs: 1, sm: 0 },
                }}
            >
                {[1, 2, 3, 4].map((index) => (
                    <Card
                        key={index}
                        sx={{
                            backgroundColor: "white",
                            borderRadius: { xs: "12px", sm: "16px" },
                            border: "1px solid #e2e8f0",
                            minHeight: { xs: 120, sm: 140 },
                        }}
                    >
                        <CardContent
                            sx={{
                                p: { xs: 2, sm: 2.5, md: 3 },
                                "&:last-child": {
                                    pb: { xs: 2, sm: 2.5, md: 3 },
                                },
                            }}
                        >
                            <Skeleton variant="text" width="60%" height={24} />
                            <Skeleton
                                variant="text"
                                width="40%"
                                height={24}
                                sx={{ my: 1 }}
                            />
                            <Skeleton variant="text" width="30%" height={24} />
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
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                mb: { xs: 3, sm: 4 },
                px: { xs: 1, sm: 0 },
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
                                    sx={{
                                        fontWeight: 600,
                                        mb: 0.5,
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                        },
                                    }}
                                >
                                    {stat.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.9)",
                                        fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.75rem",
                                        },
                                    }}
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
                                            fontSize: {
                                                xs: "0.7rem",
                                                sm: "0.75rem",
                                            },
                                        }}
                                    >
                                        คิดเป็น {stat.percentage} ของทั้งหมด
                                    </Typography>
                                )}
                            </Box>
                        }
                        arrow
                        placement="top"
                        enterDelay={isMobile ? 0 : 300}
                        leaveDelay={isMobile ? 0 : 200}
                        enterTouchDelay={0}
                        leaveTouchDelay={1500}
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
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    borderRadius: 2,
                                    boxShadow: `0 4px 20px ${stat.color}40`,
                                    maxWidth: { xs: 240, sm: 280 },
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
                                borderRadius: { xs: "12px", sm: "16px" },
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                transition: "all 0.2s ease-in-out",
                                cursor: "pointer",
                                minHeight: { xs: 120, sm: 140, md: 160 },
                                "&:hover": {
                                    transform: {
                                        xs: "scale(1.02)",
                                        sm: "translateY(-2px)",
                                    },
                                    boxShadow: `0 4px 20px ${stat.color}20`,
                                },
                                "&:active": {
                                    transform: "scale(0.98)",
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: { xs: 2, sm: 2.5, md: 3 },
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    "&:last-child": {
                                        pb: { xs: 2, sm: 2.5, md: 3 },
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        mb: { xs: 1.5, sm: 2 },
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#64748b",
                                            fontWeight: 600,
                                            fontSize: {
                                                xs: "0.75rem",
                                                sm: "0.825rem",
                                                md: "0.875rem",
                                            },
                                            lineHeight: 1.3,
                                            flex: 1,
                                        }}
                                    >
                                        {stat.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: { xs: 0.75, sm: 1 },
                                            borderRadius: {
                                                xs: "8px",
                                                sm: "12px",
                                            },
                                            backgroundColor: stat.bgColor,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconComponent
                                            size={
                                                isMobile
                                                    ? 16
                                                    : isTablet
                                                    ? 18
                                                    : 20
                                            }
                                            color={stat.color}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#1e293b",
                                            mb: stat.percentage ? 0.5 : 0,
                                            fontSize: {
                                                xs: "1.5rem",
                                                sm: "1.75rem",
                                                md: "2rem",
                                            },
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    {stat.percentage && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#64748b",
                                                fontSize: {
                                                    xs: "0.75rem",
                                                    sm: "0.825rem",
                                                    md: "0.875rem",
                                                },
                                                fontWeight: 500,
                                            }}
                                        >
                                            {stat.percentage}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Tooltip>
                );
            })}
        </Box>
    );
}
