import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  PieChart,
  Users,
  X,
  Settings,
  LogOut,
  Goal,
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

const navItems = [
  { name: "หน้าหลัก", icon: LayoutGrid, path: "/dashboard" },
  { name: "ตัวชี้วัด", icon: Goal, path: "/management" },
  { name: "สถิติ", icon: PieChart, path: "/analytics" },
  { name: "บุคลากร", icon: Users, path: "/users" },
];

export default function NavBar({ isOpen, onClose }: NavBarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSettingsClick = () => {
    alert("Settings clicked!");
  };

  // Main navigation content
  const navigationContent = (
    <Box
      sx={{
        width: isMobile ? 256 : "auto",
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
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              letterSpacing: 1,
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
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.22)",
                transform: "scale(1.08) rotate(-10deg)",
              },
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>
      )}

      {/* Navigation links */}
      <Box sx={{ flex: 1, p: isMobile ? 2 : 0 }}>
        <Box
          sx={
            isMobile
              ? {}
              : {
                  maxWidth: "1280px",
                  mx: "auto",
                  px: { sm: 3, lg: 4 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 64,
                }
          }
        >
          {/* Menu items */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? 1.5 : 3,
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
                  startIcon={<IconComponent size={22} />}
                  sx={{
                    color: isActive ? "#2575fc" : "rgba(255,255,255,0.92)",
                    backgroundColor: isActive ? "white" : "transparent",
                    justifyContent: isMobile ? "flex-start" : "center",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: isMobile ? "1.08rem" : "1.05rem",
                    px: 2.5,
                    py: 1,
                    borderRadius: 3,
                    "&:hover": {
                      backgroundColor: isActive
                        ? "white"
                        : "rgba(255,255,255,0.14)",
                      color: isActive ? "#2575fc" : "#fff",
                    },
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
          </Box>

          {/* Desktop actions */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.18)",
                  },
                }}
              >
                <Settings size={22} />
              </IconButton>
              <Button
                onClick={handleLogout}
                startIcon={<LogOut size={18} />}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 3,
                  "&:hover": {
                    backgroundColor: "#dc2626",
                  },
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
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                px: 2.5,
                py: 1,
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "#dc2626",
                },
              }}
            >
              ออกจากระบบ
            </Button>
            <IconButton
              onClick={handleSettingsClick}
              sx={{
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.10)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.18)",
                },
              }}
            >
              <Settings size={22} />
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
            width: 256,
            border: "none",
            backgroundColor: "var(--color-purple)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          },
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
        }}
      >
        {navigationContent}
      </Box>
    </>
  );
}
