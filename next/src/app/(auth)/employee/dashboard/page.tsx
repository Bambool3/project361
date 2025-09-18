import EmployeeDetail from "@/components/pages/dashboard/EmployeeDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "หน้าหลัก | Chiang Mai University",
};

export default function Page() {
    return <EmployeeDetail />;
}
