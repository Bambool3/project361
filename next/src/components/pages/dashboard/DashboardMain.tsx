import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Chip,
    InputAdornment,
} from "@mui/material";
import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Search,
    Plus,
    Edit,
    Trash2,
    Tags,
} from "lucide-react";

// รอเอาข้อมูลจริงมาแสดง
const kpiStats = [
    {
        title: "KPI ทั้งหมด",
        value: "24",
        icon: BarChart3,
        color: "var(--color-purple)",
        bgColor: "#f8fafc",
    },
    {
        title: "กำลังดำเนินการ",
        value: "3",
        percentage: "12.5%",
        icon: TrendingUp,
        color: "#3b82f6",
        bgColor: "#eff6ff",
    },
    {
        title: "เสร็จสิ้น",
        value: "18",
        percentage: "75%",
        icon: CheckCircle,
        color: "#10b981",
        bgColor: "#f0fdf4",
    },
    {
        title: "เกินกำหนด",
        value: "3",
        percentage: "12.5%",
        icon: AlertTriangle,
        color: "#ef4444",
        bgColor: "#fef2f2",
    },
];

const topics = [
    {
        id: 1,
        name: "CMU-PA",
        description: "คณะบดีไปสัญญากับมหาลัย คณบดีดูนี่ก่อน",
        kpiCount: 6,
        createdDate: "19/06/2025",
        color: "#8b5cf6",
    },
    {
        id: 2,
        name: "งานบริหาร",
        description: "ตัวชี้วัดประสิทธิภาพแผนกบริหาร",
        kpiCount: 11,
        createdDate: "21/06/2025",
        color: "#10b981",
    },
    {
        id: 3,
        name: "งานวิชาการ",
        description: "ตัวชี้วัดประสิทธิภาพแผนกวิชาการ",
        kpiCount: 7,
        createdDate: "19/08/2025",
        color: "#f59e0b",
    },
];

export default function DashboardMain() {
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Search:", event.target.value);
    };

    const handleAddTopic = () => {
        alert("เพิ่มหมวดหมู่ใหม่");
    };

    const handleEdit = (id: number) => {
        alert(`แก้ไขหมวดหมู่ ID: ${id}`);
    };

    const handleDelete = (id: number) => {
        alert(`ลบหมวดหมู่ ID: ${id}`);
    };

    return (
        <Box
            sx={{
                px: "80px",
                py: "25px",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* Upper Section - Stats Cards */}
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

            {/* Lower Section - Table */}
            <Card
                sx={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent sx={{ p: 0, px: 3.5 }}>
                    {/* Table Header */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Tags size={24} color="var(--color-purple)" />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                }}
                            >
                                รายการหมวดหมู่
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <TextField
                                placeholder="ค้นหา"
                                size="small"
                                onChange={handleSearch}
                                sx={{
                                    width: { xs: "100%", sm: "250px" },
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        backgroundColor: "#f8fafc",
                                        "&:hover fieldset": {
                                            borderColor: "var(--color-purple)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "var(--color-purple)",
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} color="#64748b" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                onClick={handleAddTopic}
                                startIcon={<Plus size={18} />}
                                sx={{
                                    backgroundColor: "var(--color-purple)",
                                    color: "white",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                    borderRadius: "12px",
                                    "&:hover": {
                                        backgroundColor: "#7c3aed",
                                    },
                                }}
                            >
                                เพิ่มหมวดหมู่
                            </Button>
                        </Box>
                    </Box>

                    {/* Table Content */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        ชื่อหมวดหมู่
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                        }}
                                    >
                                        รายละเอียด
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        จำนวน KPIs
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        วันที่สร้าง
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#475569",
                                            border: "none",
                                            py: 2,
                                            textAlign: "center",
                                        }}
                                    >
                                        จัดการ
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topics.map((topic) => (
                                    <TableRow
                                        key={topic.id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "#f8fafc",
                                            },
                                            borderBottom: "1px solid #f1f5f9",
                                        }}
                                    >
                                        <TableCell
                                            sx={{ border: "none", py: 2.5 }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            topic.color,
                                                    }}
                                                />
                                                <Typography
                                                    sx={{
                                                        fontWeight: "600",
                                                        color: "#1e293b",
                                                    }}
                                                >
                                                    {topic.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell
                                            sx={{ border: "none", py: 2.5 }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: "#64748b",
                                                    fontSize: "0.875rem",
                                                }}
                                            >
                                                {topic.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                border: "none",
                                                py: 2.5,
                                                textAlign: "center",
                                            }}
                                        >
                                            <Chip
                                                label={`${topic.kpiCount} KPIs`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: "#f1f5f9",
                                                    color: "#475569",
                                                    fontWeight: "600",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                border: "none",
                                                py: 2.5,
                                                textAlign: "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: "#64748b",
                                                    fontSize: "0.875rem",
                                                }}
                                            >
                                                {topic.createdDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                border: "none",
                                                py: 2.5,
                                                textAlign: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <IconButton
                                                    onClick={() =>
                                                        handleEdit(topic.id)
                                                    }
                                                    size="small"
                                                    sx={{
                                                        color: "#64748b",
                                                        "&:hover": {
                                                            color: "var(--color-purple)",
                                                            backgroundColor:
                                                                "#f1f5f9",
                                                        },
                                                    }}
                                                >
                                                    <Edit size={16} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() =>
                                                        handleDelete(topic.id)
                                                    }
                                                    size="small"
                                                    sx={{
                                                        color: "#64748b",
                                                        "&:hover": {
                                                            color: "#ef4444",
                                                            backgroundColor:
                                                                "#fef2f2",
                                                        },
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
