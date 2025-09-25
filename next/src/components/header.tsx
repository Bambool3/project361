"use client";

import { Menu, Bell, Search, User } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Chip,
  Badge,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { data: session } = useSession();

  const userRole = session?.user?.role || "ผู้ใช้";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        zIndex: 50,
        backdropFilter: "blur(8px)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            minHeight: { xs: "68px", sm: "72px" },
            px: { xs: 2, sm: 3, lg: 4 },
            gap: 2,
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              gap: 2,
            }}
          >
            {/* Mobile menu toggle */}
            {isMobile && (
              <IconButton
                onClick={onMenuToggle}
                sx={{
                  color: "#64748b",
                  backgroundColor: alpha("#f1f5f9", 0.8),
                  borderRadius: "12px",
                  width: 44,
                  height: 44,
                  "&:hover": {
                    color: "#475569",
                    backgroundColor: "#f1f5f9",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Menu size={22} />
              </IconButton>
            )}

            {/* Logo and branding */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background:
                      "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                    borderRadius: "50%",
                    zIndex: -1,
                    opacity: 0.1,
                  },
                }}
              >
                <Image
                  src="/cmu_logo.png"
                  alt="CMU Logo"
                  width={isMobile ? 48 : 52}
                  height={isMobile ? 48 : 52}
                  style={{
                    borderRadius: "50%",
                    border: "2px solid #f1f5f9",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {!isMobile && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: {
                        xs: "1.1rem",
                        sm: "1.25rem",
                      },
                      letterSpacing: "-0.025em",
                      lineHeight: 1,
                      background:
                        "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    KPI Tracking System
                  </Typography>
                )}
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    ระบบติดตามตัวชี้วัดตามคณะ
                  </Typography>
                )}
              </Box>

              <Chip
                label={userRole}
                size="small"
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: "28px",
                  borderRadius: "14px",
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>

            {/* Search bar - Desktop only */}
            {/* {!isMobile && (
                            <Box
                                sx={{
                                    position: "relative",
                                    maxWidth: "320px",
                                    width: "100%",
                                    ml: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        backgroundColor: alpha("#f1f5f9", 0.8),
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        "&:hover": {
                                            backgroundColor: "#f1f5f9",
                                            borderColor: "#cbd5e1",
                                        },
                                        "&:focus-within": {
                                            backgroundColor: "#ffffff",
                                            borderColor: "#6366f1",
                                            boxShadow:
                                                "0 0 0 3px rgba(99, 102, 241, 0.1)",
                                        },
                                        transition:
                                            "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                >
                                    <Search
                                        size={18}
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#64748b",
                                            zIndex: 1,
                                        }}
                                    />
                                    <InputBase
                                        placeholder="Search KPIs, reports..."
                                        sx={{
                                            width: "100%",
                                            pl: "42px",
                                            pr: 2,
                                            py: 1,
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                            color: "#1e293b",
                                            "& input::placeholder": {
                                                color: "#94a3b8",
                                                opacity: 1,
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        )} */}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Mobile search */}
            {/* {isMobile && (
                            <IconButton
                                sx={{
                                    color: "#64748b",
                                    backgroundColor: alpha("#f1f5f9", 0.8),
                                    borderRadius: "12px",
                                    width: 44,
                                    height: 44,
                                    "&:hover": {
                                        color: "#475569",
                                        backgroundColor: "#f1f5f9",
                                        transform: "scale(1.05)",
                                    },
                                    transition:
                                        "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                <Search size={20} />
                            </IconButton>
                        )} */}

            {/* Notifications */}
            <IconButton
              sx={{
                color: "#64748b",
                backgroundColor: alpha("#f1f5f9", 0.8),
                borderRadius: "12px",
                width: 44,
                height: 44,
                "&:hover": {
                  color: "#475569",
                  backgroundColor: "#f1f5f9",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Badge
                badgeContent={3}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <Bell size={20} />
              </Badge>
            </IconButton>

            {/* Profile avatar */}
            {/* <Avatar
                            sx={{
                                width: 44,
                                height: 44,
                                backgroundColor:
                                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                border: "2px solid #ffffff",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                },
                                transition:
                                    "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        >
                            <User size={22} />
                        </Avatar> */}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
