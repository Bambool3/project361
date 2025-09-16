import ManagementDetails from "@/components/pages/kpimanagement/ManagementDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ตัวชี้วัด | Chiang Mai University",
};

export default function Page() {
    return <ManagementDetails />;
}
