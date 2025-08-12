import KpiTopicDetails from "@/components/pages/topic/KpiTopicDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Chiang Mai University",
};

export default function Page() {
    return <KpiTopicDetails />;
}
