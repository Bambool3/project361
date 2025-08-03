import { Plus } from "lucide-react";
import { Box, Container, Button } from "@mui/material";

export default function SubNavBar() {
    return (
        <Box
            sx={{
                backgroundColor: "white",
                borderBottom: "1px solid #e5e7eb",
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        height: 48,
                        overflowX: "auto",
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            minWidth: "max-content",
                        }}
                    >
                        <Button
                            startIcon={<Plus size={16} />}
                            sx={{
                                color: "var(--color-purple)",
                                backgroundColor: "transparent",
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                px: 1,
                                py: 0,
                                height: 48,
                                borderRadius: 0,
                                borderBottom: "2px solid var(--color-purple)",
                                whiteSpace: "nowrap",
                                "&:hover": {
                                    backgroundColor: "rgba(139, 92, 246, 0.04)",
                                    borderBottom:
                                        "2px solid var(--color-purple)",
                                },
                                "& .MuiButton-startIcon": {
                                    marginRight: 1,
                                },
                            }}
                        >
                            เพิ่มตัวชี้วัด
                        </Button>

                        {/* Commented out buttons - uncomment when needed */}
                        {/* <Button
                            sx={{
                                color: "#6b7280", // gray-600
                                backgroundColor: "transparent",
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                px: 1,
                                py: 0,
                                height: 48,
                                borderRadius: 0,
                                whiteSpace: "nowrap",
                                "&:hover": {
                                    color: "#111827", // gray-900
                                    backgroundColor: "rgba(107, 114, 128, 0.04)",
                                },
                            }}
                        >
                            Generate KPIs
                        </Button> */}

                        {/* <Button
                            endIcon={<ChevronDown size={12} />}
                            sx={{
                                color: "#6b7280", // gray-600
                                backgroundColor: "transparent",
                                textTransform: "none",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                px: 1,
                                py: 0,
                                height: 48,
                                borderRadius: 0,
                                whiteSpace: "nowrap",
                                "&:hover": {
                                    color: "#111827", // gray-900
                                    backgroundColor: "rgba(107, 114, 128, 0.04)",
                                },
                                "& .MuiButton-endIcon": {
                                    marginLeft: 1,
                                },
                            }}
                        >
                            More Options
                        </Button> */}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
