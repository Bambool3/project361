import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutGrid,
    Database,
    Monitor,
    FileText,
    PieChart,
    Users,
    X,
    Settings,
    LogOut,
} from "lucide-react";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    useMediaQuery,
    useTheme,
} from "@mui/material";

interface NavBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavBar = ({ isOpen, onClose }: NavBarProps) => {
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const navItems = [
        { name: "หน้าหลัก", icon: LayoutGrid, path: "/dashboard" },
        { name: "ตัวชี้วัด", icon: Database, path: "/kpis" },
        // { name: "Dashboards", icon: Monitor, path: "" },
        { name: "รายงาน", icon: FileText, path: "" },
        { name: "สถิติ", icon: PieChart, path: "/analytics" },
        { name: "ผู้ใช้งาน", icon: Users, path: "/users" },
    ];

    const drawerContent = (
        <Box
            sx={{
                width: isMobile ? 256 : "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--color-purple)",
                color: "white",
            }}
        >
            {/* Mobile Header */}
            {isMobile && (
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{ fontWeight: "bold", color: "white" }}
                    >
                        CMUPA
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                color: "white",
                            },
                        }}
                    >
                        <X size={20} />
                    </IconButton>
                </Box>
            )}

            {/* Navigation Content */}
            <Box sx={{ flex: 1, p: isMobile ? 2 : 0 }}>
                <Box
                    sx={{
                        ...(isMobile
                            ? {}
                            : {
                                  maxWidth: "1280px",
                                  mx: "auto",
                                  px: { sm: 3, lg: 4 },
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  height: 56,
                              }),
                    }}
                >
                    {/* Navigation Links */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "stretch" : "center",
                            gap: isMobile ? 1 : 2,
                        }}
                    >
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <Button
                                    key={item.name}
                                    component={Link}
                                    href={item.path}
                                    onClick={onClose}
                                    startIcon={<IconComponent size={20} />}
                                    sx={{
                                        color: isActive
                                            ? "var(--color-purple)"
                                            : "rgba(255, 255, 255, 0.8)",
                                        backgroundColor: isActive
                                            ? "white"
                                            : "transparent",
                                        justifyContent: isMobile
                                            ? "flex-start"
                                            : "center",
                                        textTransform: "none",
                                        fontWeight: 500,
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: isActive
                                                ? "white"
                                                : "rgba(255, 255, 255, 0.1)",
                                            color: isActive
                                                ? "var(--color-purple)"
                                                : "white",
                                        },
                                        ...(isActive && {
                                            boxShadow:
                                                "0 1px 3px rgba(0, 0, 0, 0.1)",
                                        }),
                                    }}
                                >
                                    {item.name}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Desktop Right Side Actions */}
                    {!isMobile && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <IconButton
                                sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.1)",
                                        color: "white",
                                    },
                                }}
                            >
                                <Settings size={20} />
                            </IconButton>
                            <Button
                                onClick={handleLogout}
                                startIcon={<LogOut size={16} />}
                                sx={{
                                    color: "rgba(255, 255, 255, 0.8)",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    "&:hover": {
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                    },
                                }}
                            >
                                ออกจากระบบ
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Mobile Bottom Section */}
            {isMobile && (
                <Box>
                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Button
                            onClick={handleLogout}
                            startIcon={<LogOut size={16} />}
                            sx={{
                                color: "rgba(255, 255, 255, 0.8)",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                },
                            }}
                        >
                            ออกจากระบบ
                        </Button>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <IconButton
                                sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.1)",
                                        color: "white",
                                    },
                                }}
                            >
                                <Settings size={20} />
                            </IconButton>
                            {/* <Typography
                                variant="body2"
                                sx={{ color: "white", fontWeight: 500 }}
                            >
                                การตั้งค่า
                            </Typography> */}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={isOpen && isMobile}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: "block", lg: "none" },
                    "& .MuiDrawer-paper": {
                        width: 256,
                        border: "none",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Navigation */}
            <Box
                component="nav"
                sx={{
                    display: { xs: "none", lg: "block" },
                    backgroundColor: "var(--color-purple)",
                    width: "100%",
                }}
            >
                {drawerContent}
            </Box>
        </>
    );
};
export default NavBar;
