import StatDetail from "@/components/pages/stat/StatDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "จัดการสถิติ | Chiang Mai University",
};

export default function Page() {
    return <StatDetail />;
}
