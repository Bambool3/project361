import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import React from "react";
import {
    LayoutGrid,
    PieChart,
    Users,
    X,
    Settings,
    LogOut,
    Goal,
    Crown,
    Building2,
    ChevronDown,
    ChevronUp,
    PenLine,
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
    Collapse,
    Menu,
    MenuItem,
    Fade,
} from "@mui/material";
import { useState } from "react";

interface NavBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { name: "หน้าหลัก", icon: LayoutGrid, path: "/dashboard" },
    { name: "ตัวชี้วัด", icon: Goal, path: "/management" },
    { name: "สถิติ", icon: PieChart, path: "/stat" },
];

const managementItems = [
    { name: "ตำแหน่ง", icon: Crown, path: "/role" },
    { name: "บุคลากร", icon: Users, path: "/employee" },
    { name: "หน่วยงาน", icon: Building2, path: "/job" },
];

export default function NavBar({ isOpen, onClose }: NavBarProps) {
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

    // State for dropdown
    const [mobileManagementDropdownOpen, setMobileManagementDropdownOpen] =
        useState(false);
    const [desktopAnchorEl, setDesktopAnchorEl] = useState<null | HTMLElement>(
        null
    );
    const desktopMenuOpen = Boolean(desktopAnchorEl);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const handleSettingsClick = () => {
        alert("Settings clicked!");
    };

    const isManagementActive = managementItems.some(
        (item) => pathname === item.path
    );

    const handleDesktopMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setDesktopAnchorEl(event.currentTarget);
    };

    const handleDesktopMenuClose = () => {
        setDesktopAnchorEl(null);
    };

    const handleMobileManagementToggle = () => {
        setMobileManagementDropdownOpen(!mobileManagementDropdownOpen);
    };

    // Main navigation content
    const navigationContent = (
        <Box
            sx={{
                width: isMobile ? { xs: 280, sm: 320 } : "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--color-purple)",
                color: "#fff",
                boxShadow: isMobile
                    ? "0 4px 24px rgba(0,0,0,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                borderRadius: isMobile ? "0 16px 16px 0" : "0 0 16px 16px",
                overflow: "hidden",
            }}
        >
            {/* Mobile header with close button */}
            {isMobile && (
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                        minHeight: { xs: 64, sm: 72 },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: "bold",
                            color: "#fff",
                            letterSpacing: 1,
                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        }}
                    >
                        CMUPA
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,0.12)",
                            borderRadius: "50%",
                            border: "1.5px solid rgba(255,255,255,0.22)",
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.22)",
                                transform: "scale(1.08) rotate(-10deg)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}
                    >
                        <X size={isMobile ? 20 : 24} />
                    </IconButton>
                </Box>
            )}

            {/* Navigation links */}
            <Box
                sx={{
                    flex: 1,
                    p: isMobile ? { xs: 2, sm: 2.5 } : 0,
                    overflowY: isMobile ? "auto" : "visible",
                }}
            >
                <Box
                    sx={
                        isMobile
                            ? {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: { xs: 1, sm: 1.5 },
                              }
                            : {
                                  maxWidth: "1280px",
                                  mx: "auto",
                                  px: { sm: 3, lg: 4 },
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  height: { xs: 56, sm: 64 },
                              }
                    }
                >
                    {/* Menu items */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "stretch" : "center",
                            gap: isMobile ? { xs: 0.5, sm: 1 } : 3,
                        }}
                    >
                        {/* Regular nav items */}
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <Button
                                    key={item.name}
                                    component={Link}
                                    href={item.path}
                                    onClick={onClose}
                                    startIcon={
                                        <IconComponent
                                            size={
                                                isMobile
                                                    ? isTablet
                                                        ? 20
                                                        : 18
                                                    : 22
                                            }
                                        />
                                    }
                                    sx={{
                                        color: isActive
                                            ? "#2575fc"
                                            : "rgba(255,255,255,0.92)",
                                        backgroundColor: isActive
                                            ? "white"
                                            : "transparent",
                                        justifyContent: isMobile
                                            ? "flex-start"
                                            : "center",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: {
                                            xs: "0.9rem",
                                            sm: "1rem",
                                            lg: "1.05rem",
                                        },
                                        px: { xs: 2, sm: 2.5 },
                                        py: { xs: 1.25, sm: 1.5, lg: 1 },
                                        borderRadius: 3,
                                        minHeight: { xs: 44, sm: 48 },
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            backgroundColor: isActive
                                                ? "white"
                                                : "rgba(255,255,255,0.14)",
                                            color: isActive
                                                ? "#2575fc"
                                                : "#fff",
                                            transform: isMobile
                                                ? "translateX(4px)"
                                                : "none",
                                        },
                                        "&:active": {
                                            transform: "scale(0.98)",
                                        },
                                    }}
                                >
                                    {item.name}
                                </Button>
                            );
                        })}

                        {/* Management Dropdown */}
                        {isMobile ? (
                            // Mobile dropdown
                            <Box>
                                <Button
                                    onClick={handleMobileManagementToggle}
                                    startIcon={<PenLine size={18} />}
                                    endIcon={
                                        mobileManagementDropdownOpen ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )
                                    }
                                    sx={{
                                        color: isManagementActive
                                            ? "#2575fc"
                                            : "rgba(255,255,255,0.92)",
                                        backgroundColor: isManagementActive
                                            ? "white"
                                            : "transparent",
                                        justifyContent: "flex-start",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        px: 2,
                                        py: 1.25,
                                        borderRadius: 3,
                                        minHeight: 44,
                                        width: "100%",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            backgroundColor: isManagementActive
                                                ? "white"
                                                : "rgba(255,255,255,0.14)",
                                            color: isManagementActive
                                                ? "#2575fc"
                                                : "#fff",
                                            transform: "translateX(4px)",
                                        },
                                    }}
                                >
                                    จัดการ
                                </Button>

                                <Collapse in={mobileManagementDropdownOpen}>
                                    <Box sx={{ pl: 2, pt: 1 }}>
                                        {managementItems.map((item) => {
                                            const IconComponent = item.icon;
                                            const isActive =
                                                pathname === item.path;

                                            return (
                                                <Button
                                                    key={item.name}
                                                    component={Link}
                                                    href={item.path}
                                                    onClick={onClose}
                                                    startIcon={
                                                        <IconComponent
                                                            size={16}
                                                        />
                                                    }
                                                    sx={{
                                                        color: isActive
                                                            ? "#2575fc"
                                                            : "rgba(255,255,255,0.8)",
                                                        backgroundColor:
                                                            isActive
                                                                ? "white"
                                                                : "transparent",
                                                        justifyContent:
                                                            "flex-start",
                                                        textTransform: "none",
                                                        fontWeight: 500,
                                                        fontSize: "0.85rem",
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        minHeight: 36,
                                                        width: "100%",
                                                        mb: 0.5,
                                                        transition:
                                                            "all 0.2s ease-in-out",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                isActive
                                                                    ? "rgba(255,255,255,0.2)"
                                                                    : "rgba(255,255,255,0.1)",
                                                            transform:
                                                                "translateX(2px)",
                                                        },
                                                    }}
                                                >
                                                    {item.name}
                                                </Button>
                                            );
                                        })}
                                    </Box>
                                </Collapse>
                            </Box>
                        ) : (
                            // Desktop dropdown
                            <>
                                <Button
                                    onClick={handleDesktopMenuClick}
                                    startIcon={<PenLine size={22} />}
                                    endIcon={<ChevronDown size={16} />}
                                    sx={{
                                        color: isManagementActive
                                            ? "#2575fc"
                                            : "rgba(255,255,255,0.92)",
                                        backgroundColor: isManagementActive
                                            ? "white"
                                            : "transparent",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "1.05rem",
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 3,
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": {
                                            backgroundColor: isManagementActive
                                                ? "white"
                                                : "rgba(255,255,255,0.14)",
                                            color: isManagementActive
                                                ? "#2575fc"
                                                : "#fff",
                                        },
                                    }}
                                >
                                    จัดการ
                                </Button>

                                <Menu
                                    anchorEl={desktopAnchorEl}
                                    open={desktopMenuOpen}
                                    onClose={handleDesktopMenuClose}
                                    TransitionComponent={Fade}
                                    sx={{
                                        "& .MuiPaper-root": {
                                            backgroundColor: "white",
                                            borderRadius: "12px",
                                            boxShadow:
                                                "0 8px 32px rgba(0,0,0,0.12)",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            minWidth: "180px",
                                            mt: 1,
                                        },
                                    }}
                                >
                                    {managementItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const isActive = pathname === item.path;

                                        return (
                                            <MenuItem
                                                key={item.name}
                                                component={Link}
                                                href={item.path}
                                                onClick={handleDesktopMenuClose}
                                                sx={{
                                                    color: isActive
                                                        ? "#2575fc"
                                                        : "#374151",
                                                    backgroundColor: isActive
                                                        ? "#f0f9ff"
                                                        : "transparent",
                                                    px: 2,
                                                    py: 1.5,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    fontSize: "0.95rem",
                                                    fontWeight: isActive
                                                        ? 600
                                                        : 500,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            isActive
                                                                ? "#e0f2fe"
                                                                : "#f8fafc",
                                                        color: isActive
                                                            ? "#1e40af"
                                                            : "#1f2937",
                                                    },
                                                }}
                                            >
                                                <IconComponent size={18} />
                                                {item.name}
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </>
                        )}
                    </Box>

                    {/* Desktop actions */}
                    {!isMobile && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: { sm: 1.5, lg: 2 },
                            }}
                        >
                            <IconButton
                                onClick={handleSettingsClick}
                                sx={{
                                    color: "#fff",
                                    width: { sm: 40, lg: 44 },
                                    height: { sm: 40, lg: 44 },
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(255,255,255,0.18)",
                                        transform: "scale(1.05)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                <Settings size={isTablet ? 20 : 22} />
                            </IconButton>
                            <Button
                                onClick={handleLogout}
                                startIcon={<LogOut size={isTablet ? 16 : 18} />}
                                sx={{
                                    color: "#fff",
                                    backgroundColor: "rgba(255,255,255,0.10)",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: { sm: "0.875rem", lg: "0.9rem" },
                                    px: { sm: 2, lg: 2.5 },
                                    py: { sm: 1, lg: 1.2 },
                                    borderRadius: 3,
                                    minHeight: { sm: 36, lg: 40 },
                                    "&:hover": {
                                        backgroundColor: "#dc2626",
                                        transform: "scale(1.02)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                ออกจากระบบ
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Mobile bottom actions */}
            {isMobile && (
                <Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.18)" }} />
                    <Box
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            minHeight: { xs: 68, sm: 76 },
                        }}
                    >
                        <Button
                            onClick={handleLogout}
                            startIcon={<LogOut size={18} />}
                            sx={{
                                color: "#fff",
                                backgroundColor: "#ef4444",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: { xs: "0.875rem", sm: "0.9rem" },
                                px: { xs: 2, sm: 2.5 },
                                py: { xs: 1, sm: 1.2 },
                                borderRadius: 3,
                                flex: 1,
                                minHeight: { xs: 40, sm: 44 },
                                maxWidth: "200px",
                                "&:hover": {
                                    backgroundColor: "#dc2626",
                                    transform: "scale(1.02)",
                                },
                                "&:active": {
                                    transform: "scale(0.98)",
                                },
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            ออกจากระบบ
                        </Button>
                        <IconButton
                            onClick={handleSettingsClick}
                            sx={{
                                color: "#fff",
                                backgroundColor: "rgba(255,255,255,0.10)",
                                width: { xs: 40, sm: 44 },
                                height: { xs: 40, sm: 44 },
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.18)",
                                    transform: "scale(1.05)",
                                },
                                "&:active": {
                                    transform: "scale(0.95)",
                                },
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            <Settings size={isTablet ? 20 : 22} />
                        </IconButton>
                    </Box>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            {/* Mobile menu drawer */}
            <Drawer
                anchor="left"
                open={isOpen && isMobile}
                onClose={onClose}
                sx={{
                    display: { xs: "block", lg: "none" },
                    "& .MuiDrawer-paper": {
                        width: { xs: 280, sm: 320 },
                        border: "none",
                        backgroundColor: "var(--color-purple)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    },
                    "& .MuiBackdrop-root": {
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(4px)",
                    },
                }}
                transitionDuration={{
                    enter: 300,
                    exit: 250,
                }}
            >
                {navigationContent}
            </Drawer>

            {/* Desktop navigation bar */}
            <Box
                component="nav"
                sx={{
                    display: { xs: "none", lg: "block" },
                    backgroundColor: "var(--color-purple)",
                    width: "100%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    position: "sticky",
                    top: 0,
                    zIndex: theme.zIndex.appBar,
                }}
            >
                {navigationContent}
            </Box>
        </>
    );
}
