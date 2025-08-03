import { Menu, X, HelpCircle, UserCircle, NotepadText } from "lucide-react";
import Image from "next/image";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Container,
    useMediaQuery,
    useTheme,
} from "@mui/material";

interface HeaderProps {
    onMenuToggle: () => void;
    isMobileMenuOpen: boolean;
}

export default function Header({
    onMenuToggle,
    isMobileMenuOpen,
}: HeaderProps) {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

    return (
        <AppBar
            position="sticky"
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
                    {/* Left section: Logo and Title */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: 1,
                        }}
                    >
                        {!isLargeScreen && (
                            <IconButton
                                onClick={onMenuToggle}
                                sx={{
                                    mr: 1.5,
                                    color: "#9ca3af",
                                    "&:hover": {
                                        color: "#6b7280",
                                        backgroundColor: "#f3f4f6",
                                    },
                                    "&:focus": {
                                        outline: "none",
                                        boxShadow: `0 0 0 2px var(--color-purple)`,
                                    },
                                }}
                            >
                                {isMobileMenuOpen ? (
                                    <X size={24} />
                                ) : (
                                    <Menu size={24} />
                                )}
                            </IconButton>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Image
                                src={"/cmu_logo.png"}
                                alt="cmu_logo"
                                width={50}
                                height={50}
                            />
                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    fontWeight: "bold",
                                    color: "#111827",
                                    fontSize: "1.25rem",
                                }}
                            >
                                CMUPA
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right section: Actions */}
                    <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                        <IconButton
                            sx={{
                                color: "#9ca3af",
                                "&:hover": {
                                    color: "var(--color-purple)",
                                    backgroundColor: "#f3f4f6",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            <HelpCircle size={20} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
