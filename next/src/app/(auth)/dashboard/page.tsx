import DashboardDetail from "@/components/pages/dashboard/DashboardDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "หน้าหลัก | Chiang Mai University",
};

export default function Page() {
    return <DashboardDetail />;
}
