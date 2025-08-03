import LoginDetails from "@/components/pages/login/LoginDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "CMUPA | Chiang Mai University",
};

export default function Page() {
    return <LoginDetails />;
}
