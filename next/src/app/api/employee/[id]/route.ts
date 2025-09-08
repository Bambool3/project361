import { EmployeeServerService } from "@/server/services/employee/employee-server-service";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const employeeId = params.id;

        // Validate required fields for update
        if (
            !body.first_name?.trim() ||
            !body.last_name?.trim() ||
            !body.email?.trim() ||
            !body.role_id?.trim() ||
            !body.department_id?.trim()
        ) {
            return NextResponse.json(
                {
                    error: "ชื่อ นามสกุล อีเมล ตำแหน่ง และหน่วยงานจำเป็นต้องกรอก",
                },
                { status: 400 }
            );
        }

        // Check if email already exists for other employees
        const existingEmployee = await EmployeeServerService.getEmployeeByEmail(
            body.email
        );
        if (existingEmployee && existingEmployee.id !== employeeId) {
            return NextResponse.json(
                { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
                { status: 409 }
            );
        }

        const updateData: any = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            role_id: body.role_id,
            department_id: body.department_id,
        };

        // Hash password if provided
        if (body.password?.trim()) {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            updateData.password = hashedPassword;
        }

        const updatedEmployee = await EmployeeServerService.updateEmployee(
            employeeId,
            updateData
        );

        return NextResponse.json(updatedEmployee, { status: 200 });
    } catch (error) {
        console.error("Error updating employee:", error);

        if (error instanceof Error) {
            if (error.message.includes("not found")) {
                return NextResponse.json(
                    { error: "ไม่พบบุคลากรที่ต้องการแก้ไข" },
                    { status: 404 }
                );
            }
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const employeeId = params.id;

        // Check if employee exists
        const existingEmployee = await EmployeeServerService.getEmployeeById(
            employeeId
        );
        if (!existingEmployee) {
            return NextResponse.json(
                { error: "ไม่พบบุคลากรที่ต้องการลบ" },
                { status: 404 }
            );
        }

        // Delete the employee
        await EmployeeServerService.deleteEmployee(employeeId);

        return NextResponse.json(
            { message: "ลบบุคลากรสำเร็จ" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting employee:", error);

        if (error instanceof Error) {
            if (error.message.includes("not found")) {
                return NextResponse.json(
                    { error: "ไม่พบบุคลากรที่ต้องการลบ" },
                    { status: 404 }
                );
            }
            if (error.message.includes("associated indicators")) {
                return NextResponse.json(
                    {
                        error: "ไม่สามารถลบบุคลากรที่มีตัวชี้วัดที่เกี่ยวข้องได้",
                    },
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
