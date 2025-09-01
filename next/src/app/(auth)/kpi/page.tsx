import KpiTopicDetails from "@/components/pages/kpi/KpiDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ตัวชี้วัด | Chiang Mai University",
};

export default function Page() {
    return <KpiTopicDetails />;
}
