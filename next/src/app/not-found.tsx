"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { keyframes } from "@mui/material/styles";

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

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
`;

export default function NotFound() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "loading") return;

      if (session?.user?.role) {
        const userRole = session.user.role;

        if (userRole === "ผู้ดูแลระบบ" || userRole === "ฝ่ายแผน") {
          router.push("/admin/dashboard");
        } else if (userRole === "บุคลากร") {
          router.push("/employee/dashboard");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, session, status]);

  const getRedirectMessage = () => {
    if (status === "loading") {
      return "กำลังตรวจสอบสิทธิ์การเข้าใช้...";
    }

    if (session?.user?.role) {
      const userRole = session.user.role;
      if (userRole === "ผู้ดูแลระบบ" || userRole === "ฝ่ายแผน") {
        return "กำลังเปลี่ยนเส้นทางไปหน้า Admin Dashboard...";
      } else if (userRole === "บุคลากร") {
        return "กำลังเปลี่ยนเส้นทางไปหน้า Employee Dashboard...";
      }
      return "กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...";
    }

    return "กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
          `,
          animation: `${spin} 30s linear infinite`,
        },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            color: "white",
            position: "relative",
            zIndex: 1,
            animation: `${fadeInUp} 1s ease-out`,
          }}
        >
          {/* 404 Number */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "5rem", md: "8rem" },
              fontWeight: 800,
              mb: 2,
              letterSpacing: "-0.05em",
              background: "linear-gradient(45deg, #ffffff 30%, #f8fafc 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </Typography>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              fontWeight: 600,
              mb: 2,
              opacity: 0.95,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              letterSpacing: "-0.02em",
            }}
          >
            หน้าที่คุณค้นหาไม่พบ
          </Typography>

          {/* Status Message */}
          <Typography
            variant="body1"
            sx={{
              fontSize: "1.2rem",
              mb: 5,
              opacity: 0.85,
              fontWeight: 400,
              animation: `${pulse} 2s ease-in-out infinite`,
              textShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            {getRedirectMessage()}
          </Typography>

          {/* Enhanced Loading Spinner */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer glow ring */}
            <CircularProgress
              size={80}
              thickness={2}
              sx={{
                position: "absolute",
                color: "rgba(255, 255, 255, 0.2)",
                animation: `${spin} 3s linear infinite reverse`,
              }}
            />
            {/* Main spinner */}
            <CircularProgress
              size={50}
              thickness={4}
              sx={{
                color: "white",
                filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
              }}
            />
            {/* Center dot */}
            <Box
              sx={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "white",
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            />
          </Box>
        </Box>
      </Container>

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
  );
}
