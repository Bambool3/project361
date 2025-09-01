import DashboardDetails from "@/components/pages/dashboard/DashboardDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "หน้าหลัก | Chiang Mai University",
};

export default function Page() {
    return <DashboardDetails />;
}
