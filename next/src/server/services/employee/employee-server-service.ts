import prisma from "@/lib/db";
import { Employee, EmployeeFormData } from "@/types/employee";

export class EmployeeServerService {
    static async getEmployees(): Promise<Employee[]> {
        try {
            const employees = await prisma.user.findMany({
                include: {
                    role: true,
                    department: true,
                    indicators: true,
                },
                orderBy: [
                    {
                        first_name: "asc",
                    },
                ],
            });

            return employees.map((employee: any) => ({
                id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                role: {
                    id: employee.role.id,
                    role_name: employee.role.role_name,
                },
                role_id: employee.role_id,
                department: {
                    id: employee.department.id,
                    department_name: employee.department.department_name,
                },
                department_id: employee.department_id,
            }));
        } catch (error) {
            console.error("Error fetching employees from database:", error);
            throw new Error("Failed to fetch employees from database");
        }
    }

    static async getEmployeeByEmail(email: string): Promise<Employee | null> {
        try {
            const employee = await prisma.user.findFirst({
                where: {
                    email: {
                        equals: email.trim(),
                        mode: "insensitive",
                    },
                },
                include: {
                    role: true,
                    department: true,
                    indicators: true,
                },
            });

            if (!employee) {
                return null;
            }

            return {
                id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                role: {
                    id: employee.role.id,
                    role_name: employee.role.role_name,
                },
                role_id: employee.role_id,
                department: {
                    id: employee.department.id,
                    department_name: employee.department.department_name,
                },
                department_id: employee.department_id,
            };
        } catch (error) {
            console.error(
                "Error fetching employee by email from database:",
                error
            );
            throw new Error("Failed to fetch employee by email from database");
        }
    }

    static async createEmployee(data: EmployeeFormData): Promise<Employee> {
        try {
            // Validate input
            if (
                !data.first_name?.trim() ||
                !data.last_name?.trim() ||
                !data.email?.trim() ||
                !data.password?.trim() ||
                !data.role_id?.trim() ||
                !data.department_id?.trim()
            ) {
                throw new Error("All required fields must be provided");
            }

            const newEmployee = await prisma.user.create({
                data: {
                    id: `emp_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
                    first_name: data.first_name.trim(),
                    last_name: data.last_name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                    role_id: data.role_id,
                    department_id: data.department_id,
                },
                include: {
                    role: true,
                    department: true,
                    indicators: true,
                },
            });

            return {
                id: newEmployee.id,
                first_name: newEmployee.first_name,
                last_name: newEmployee.last_name,
                email: newEmployee.email,
                role: {
                    id: newEmployee.role.id,
                    role_name: newEmployee.role.role_name,
                },
                role_id: newEmployee.role_id,
                department: {
                    id: newEmployee.department.id,
                    department_name: newEmployee.department.department_name,
                },
                department_id: newEmployee.department_id,
            };
        } catch (error) {
            console.error("Error creating employee in database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create employee in database");
        }
    }

    static async updateEmployee(
        id: string,
        data: Partial<EmployeeFormData>
    ): Promise<Employee> {
        try {
            if (!id?.trim()) {
                throw new Error("Employee ID is required");
            }

            // Check if employee exists
            const existingEmployee = await prisma.user.findUnique({
                where: { id: id.trim() },
            });

            if (!existingEmployee) {
                throw new Error("Employee not found");
            }

            const updateData: any = {};

            if (data.first_name?.trim()) {
                updateData.first_name = data.first_name.trim();
            }
            if (data.last_name?.trim()) {
                updateData.last_name = data.last_name.trim();
            }
            if (data.email?.trim()) {
                updateData.email = data.email.trim();
            }
            if (data.role_id?.trim()) {
                updateData.role_id = data.role_id.trim();
            }
            if (data.department_id?.trim()) {
                updateData.department_id = data.department_id.trim();
            }
            // Only update password if provided
            if (data.password?.trim()) {
                updateData.password = data.password;
            }

            const updatedEmployee = await prisma.user.update({
                where: { id: id.trim() },
                data: updateData,
                include: {
                    role: true,
                    department: true,
                    indicators: true,
                },
            });

            return {
                id: updatedEmployee.id,
                first_name: updatedEmployee.first_name,
                last_name: updatedEmployee.last_name,
                email: updatedEmployee.email,
                role: {
                    id: updatedEmployee.role.id,
                    role_name: updatedEmployee.role.role_name,
                },
                role_id: updatedEmployee.role_id,
                department: {
                    id: updatedEmployee.department.id,
                    department_name: updatedEmployee.department.department_name,
                },
                department_id: updatedEmployee.department_id,
            };
        } catch (error) {
            console.error("Error updating employee in database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update employee in database");
        }
    }

    static async deleteEmployee(employeeId: string): Promise<void> {
        try {
            // Check if employee exists
            const existingEmployee = await prisma.user.findUnique({
                where: { id: employeeId },
                include: {
                    indicators: true,
                },
            });

            if (!existingEmployee) {
                throw new Error("Employee not found");
            }

            // Check if employee has any associated indicators
            if (
                existingEmployee.indicators &&
                existingEmployee.indicators.length > 0
            ) {
                throw new Error(
                    "Cannot delete employee with associated indicators"
                );
            }

            // Delete the employee
            await prisma.user.delete({
                where: { id: employeeId },
            });
        } catch (error) {
            console.error("Error deleting employee from database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to delete employee from database");
        }
    }

    static async getEmployeeById(employeeId: string): Promise<Employee | null> {
        try {
            const employee = await prisma.user.findUnique({
                where: { id: employeeId },
                include: {
                    role: true,
                    department: true,
                    indicators: true,
                },
            });

            if (!employee) {
                return null;
            }

            return {
                id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                role: {
                    id: employee.role.id,
                    role_name: employee.role.role_name,
                },
                role_id: employee.role_id,
                department: {
                    id: employee.department.id,
                    department_name: employee.department.department_name,
                },
                department_id: employee.department_id,
            };
        } catch (error) {
            console.error(
                "Error fetching employee by ID from database:",
                error
            );
            throw new Error("Failed to fetch employee by ID from database");
        }
    }
}
