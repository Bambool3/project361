"use client";

import { useRouter } from "next/navigation";
import { getSession, signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import {
    TextField,
    Button,
    Paper,
    Box,
    Typography,
    Avatar,
    Checkbox,
    FormControlLabel,
    Alert,
    Snackbar,
    CircularProgress,
    keyframes,
} from "@mui/material";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

// Animations
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const schema = z.object({
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z.string().min(1, "รหัสผ่านต้องจำเป็นต้องมีอย่างน้อย 1 ตัว"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
    const r = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<
        "error" | "success" | "warning" | "info"
    >("error");

    const { data: session, status, update } = useSession();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const showAlert = (
        message: string,
        severity: "error" | "success" | "warning" | "info" = "error"
    ) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    const handleCloseAlert = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setAlertOpen(false);
    };

    async function submitForm(data: FormData) {
        setIsLoading(true);

        const response = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (response?.error) {
            showAlert(response.error);
            setIsLoading(false);
        } else if (response?.ok) {
            const newSession = await getSession();
            const userRole = newSession?.user?.role;

            if (userRole === "ผู้ดูแลระบบ" || userRole === "ฝ่ายแผน") {
                r.push("/admin/dashboard");
            } else if (userRole === "บุคลากร") {
                r.push("/employee/dashboard");
            } else {
                r.push("/");
            }
        }
    }

    return (
        <>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{
                    background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    px: { xs: 2, sm: 3, md: 0 },
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: { xs: 3, sm: 4, md: 5 },
                        maxWidth: { xs: "100%", sm: 400, md: 450 },
                        width: "100%",
                        borderRadius: { xs: 2, sm: 3 },
                        mx: { xs: 1, sm: 2 },
                    }}
                >
                    {/* Header with Logo and Title */}
                    <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
                        <Avatar
                            sx={{
                                width: { xs: 56, sm: 64 },
                                height: { xs: 56, sm: 64 },
                                mx: "auto",
                                mb: 2,
                                backgroundColor: "#ede9fe",
                                color: "var(--color-purple)",
                            }}
                        >
                            <Image
                                src={"/cmu_logo.png"}
                                alt="cmu_logo"
                                width={50}
                                height={50}
                                style={{
                                    width: "auto",
                                    height: "70%",
                                    objectFit: "contain",
                                }}
                            />
                        </Avatar>
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight="bold"
                            color="text.primary"
                            gutterBottom
                            sx={{
                                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                            }}
                        >
                            KPI Tracking System
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                        >
                            ระบบติดตามตัวชี้วัดตามคณะ
                        </Typography>
                    </Box>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(submitForm)}>
                        <Box mb={{ xs: 2.5, sm: 3 }}>
                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="อีเมลของท่าน"
                                        type="email"
                                        autoComplete="email"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        size="medium"
                                        InputProps={{
                                            startAdornment: (
                                                <Mail
                                                    size={20}
                                                    style={{
                                                        marginRight: 8,
                                                        color: "#9ca3af",
                                                    }}
                                                />
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                "&:hover fieldset": {
                                                    borderColor:
                                                        "var(--color-purple)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor:
                                                        "var(--color-purple)",
                                                },
                                            },
                                            "& .MuiInputLabel-root.Mui-focused":
                                                {
                                                    color: "var(--color-purple)",
                                                },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        <Box mb={{ xs: 2.5, sm: 3 }}>
                            <Controller
                                name="password"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="รหัสผ่านของท่าน"
                                        type="password"
                                        autoComplete="current-password"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        size="medium"
                                        InputProps={{
                                            startAdornment: (
                                                <Lock
                                                    size={20}
                                                    style={{
                                                        marginRight: 8,
                                                        color: "#9ca3af",
                                                    }}
                                                />
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                "&:hover fieldset": {
                                                    borderColor:
                                                        "var(--color-purple)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor:
                                                        "var(--color-purple)",
                                                },
                                            },
                                            "& .MuiInputLabel-root.Mui-focused":
                                                {
                                                    color: "var(--color-purple)",
                                                },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {/* Remember Me Checkbox */}
                        <Box mb={{ xs: 2.5, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        sx={{
                                            color: "var(--color-purple)",
                                            "&.Mui-checked": {
                                                color: "var(--color-purple)",
                                            },
                                        }}
                                    />
                                }
                                label="จดจำการเข้าสู่ระบบ"
                                sx={{
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: {
                                            xs: "0.8rem",
                                            sm: "0.875rem",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={
                                isLoading ? (
                                    <CircularProgress
                                        size={16}
                                        sx={{ color: "white" }}
                                    />
                                ) : null
                            }
                            sx={{
                                backgroundColor: "var(--color-purple)",
                                "&:hover": {
                                    backgroundColor: "#7c3aed",
                                },
                                py: { xs: 1.25, sm: 1.5 },
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: 2,
                                minHeight: { xs: 44, sm: 48 },
                            }}
                        >
                            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                        </Button>
                    </form>
                </Paper>

                {/* Decorative bubbles */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "10%",
                        right: "10%",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.05)",
                        animation: `${fadeInUp} 2s ease-out 0.5s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "15%",
                        left: "15%",
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.03)",
                        animation: `${fadeInUp} 2s ease-out 1s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "25%",
                        right: "20%",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.04)",
                        animation: `${fadeInUp} 2s ease-out 1.5s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "30%",
                        left: "10%",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.06)",
                        animation: `${fadeInUp} 2s ease-out 2s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "60%",
                        left: "25%",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.035)",
                        animation: `${fadeInUp} 2s ease-out 0.8s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "20%",
                        right: "30%",
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.045)",
                        animation: `${fadeInUp} 2s ease-out 1.2s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "40%",
                        right: "5%",
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.055)",
                        animation: `${fadeInUp} 2s ease-out 1.8s both`,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "50%",
                        left: "5%",
                        width: 55,
                        height: 55,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.04)",
                        animation: `${fadeInUp} 2s ease-out 0.3s both`,
                    }}
                />
            </Box>

            {/* Snackbar for alerts */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alertSeverity}
                    sx={{
                        width: { xs: "60%", sm: "100%" },
                        minWidth: 200,
                        mx: "auto",
                    }}
                    variant="filled"
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
