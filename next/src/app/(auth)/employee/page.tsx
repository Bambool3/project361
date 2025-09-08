import EmployeeDetail from "@/components/pages/employee/EmployeeDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "จัดการบุคลากร | Chiang Mai University",
};

export default function Page() {
    return <EmployeeDetail />;
}
