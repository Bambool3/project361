import { EmployeeServerService } from "@/server/services/employee/employee-server-service";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        const employees = await EmployeeServerService.getEmployees();
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json(
            { error: "Failed to fetch employees" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (
            !body.first_name?.trim() ||
            !body.last_name?.trim() ||
            !body.email?.trim() ||
            !body.password?.trim() ||
            !body.role_ids?.length ||
            !body.jobtitle_ids?.length
        ) {
            return NextResponse.json(
                {
                    error: "ชื่อ-นามสกุล อีเมล รหัสผ่าน บทบาท และตำแหน่งงานจำเป็นต้องกรอก",
                },
                { status: 400 }
            );
        }

        // Check if this employee already exists
        const existingEmployee = await EmployeeServerService.getEmployeeByEmail(
            body.email
        );
        if (existingEmployee) {
            return NextResponse.json(
                { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        const employeeData = {
            ...body,
            password: hashedPassword,
        };

        const newEmployee = await EmployeeServerService.createEmployee(
            employeeData
        );

        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        console.error("Error creating employee:", error);

        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return NextResponse.json(
                    { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
                    { status: 409 }
                );
            }
            if (error.message.includes("required")) {
                return NextResponse.json(
                    { error: "ข้อมูลที่จำเป็นไม่ครบถ้วน" },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในระบบ" },
            { status: 500 }
        );
    }
}
