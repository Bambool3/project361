import DataDetail from "@/components/pages/data/DataDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ข้อมูล | Chiang Mai University",
};

export default function Page() {
    return <DataDetail />;
}
