import { Menu } from "lucide-react";
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
} from "@mui/material";

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { data: session } = useSession();

    const userRole = session?.user?.role || "ผู้ใช้";

    // const handleHelpClick = () => {
    //     alert("Help clicked! Add help functionality here.");
    // };

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: "white",
                borderBottom: "1px solid #e5e7eb",
                boxShadow: "none",
                zIndex: 50,
            }}
        >
            <Container maxWidth="xl">
                <Toolbar
                    sx={{ minHeight: "64px", px: { xs: 2, sm: 3, lg: 4 } }}
                >
                    {/* Left side */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: 1,
                        }}
                    >
                        {/* Show hamburger menu only on mobile */}
                        {isMobile && (
                            <IconButton
                                onClick={onMenuToggle}
                                sx={{
                                    mr: 1.5,
                                    color: "#9ca3af",
                                    "&:hover": {
                                        color: "#6b7280",
                                        backgroundColor: "#f3f4f6",
                                    },
                                }}
                            >
                                <Menu size={24} />
                            </IconButton>
                        )}

                        {/* Logo, title, and role badge */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Image
                                src="/cmu_logo.png"
                                alt="CMU Logo"
                                width={50}
                                height={50}
                            />
                            {!isMobile && (
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#111827",
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    CMUPA
                                </Typography>
                            )}
                            <Chip
                                label={userRole}
                                size="small"
                                sx={{
                                    backgroundColor: "var(--color-purple)",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    height: "24px",
                                    "& .MuiChip-label": {
                                        px: 1.5,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Right side */}
                    {/* <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            onClick={handleHelpClick}
                            sx={{
                                color: "#9ca3af",
                                "&:hover": {
                                    color: "var(--color-purple)",
                                    backgroundColor: "#f3f4f6",
                                },
                            }}
                        >
                            <HelpCircle size={20} />
                        </IconButton>
                    </Box> */}
                </Toolbar>
            </Container>
        </AppBar>
    );
}
