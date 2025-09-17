import prisma from "@/lib/db";
import { Employee, EmployeeFormData } from "@/types/employee";

export class EmployeeServerService {
    static async getEmployees(): Promise<Employee[]> {
        try {
            const employees = await prisma.user.findMany({
                include: {
                    user_roles: {
                        include: {
                            role: true,
                        },
                    },
                    user_jobtitle: {
                        include: {
                            jobtitle: true,
                        },
                    },
                    indicators: true,
                },
                orderBy: [
                    {
                        first_name: "asc",
                    },
                ],
            });

            return employees.map((employee: any) => ({
                id: employee.user_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                roles: employee.user_roles.map((ur: any) => ({
                    id: ur.role.role_id,
                    name: ur.role.name,
                })),
                job_titles: employee.user_jobtitle.map((uj: any) => ({
                    id: uj.jobtitle.jobtitle_id,
                    name: uj.jobtitle.name,
                })),
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
                    user_roles: {
                        include: {
                            role: true,
                        },
                    },
                    user_jobtitle: {
                        include: {
                            jobtitle: true,
                        },
                    },
                    indicators: true,
                },
            });

            if (!employee) {
                return null;
            }

            return {
                id: employee.user_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                roles: employee.user_roles.map((ur: any) => ({
                    id: ur.role.role_id,
                    name: ur.role.name,
                })),
                job_titles: employee.user_jobtitle.map((uj: any) => ({
                    id: uj.jobtitle.jobtitle_id,
                    name: uj.jobtitle.name,
                })),
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
                !data.role_ids?.length ||
                !data.jobtitle_ids?.length
            ) {
                throw new Error("All required fields must be provided");
            }

            // Create the user first
            const newUser = await prisma.user.create({
                data: {
                    first_name: data.first_name.trim(),
                    last_name: data.last_name.trim(),
                    email: data.email.trim(),
                    password: data.password,
                },
            });

            // Create user-role relationships
            const userRoleData = data.role_ids.map((roleId) => ({
                user_id: newUser.user_id,
                role_id: roleId,
            }));
            await prisma.userRole.createMany({
                data: userRoleData,
            });

            // Create user-jobtitle relationships
            const userJobTitleData = data.jobtitle_ids.map((jobTitleId) => ({
                user_id: newUser.user_id,
                jobtitle_id: jobTitleId,
            }));
            await prisma.userJobTitle.createMany({
                data: userJobTitleData,
            });

            // Fetch the complete user with relationships
            const employee = await prisma.user.findUnique({
                where: { user_id: newUser.user_id },
                include: {
                    user_roles: {
                        include: {
                            role: true,
                        },
                    },
                    user_jobtitle: {
                        include: {
                            jobtitle: true,
                        },
                    },
                },
            });

            if (!employee) {
                throw new Error("Failed to retrieve created employee");
            }

            return {
                id: employee.user_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                roles: employee.user_roles.map((ur: any) => ({
                    id: ur.role.role_id,
                    name: ur.role.name,
                })),
                job_titles: employee.user_jobtitle.map((uj: any) => ({
                    id: uj.jobtitle.jobtitle_id,
                    name: uj.jobtitle.name,
                })),
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

            const userId = id;

            // Check if employee exists
            const existingEmployee = await prisma.user.findUnique({
                where: { user_id: userId },
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
            if (data.password?.trim()) {
                updateData.password = data.password;
            }

            await prisma.user.update({
                where: { user_id: userId },
                data: updateData,
            });

            // Update roles if provided
            if (data.role_ids?.length) {
                await prisma.userRole.deleteMany({
                    where: { user_id: userId },
                });

                const userRoleData = data.role_ids.map((roleId) => ({
                    user_id: userId,
                    role_id: roleId,
                }));
                await prisma.userRole.createMany({
                    data: userRoleData,
                });
            }

            // Update job titles if provided
            if (data.jobtitle_ids?.length) {
                await prisma.userJobTitle.deleteMany({
                    where: { user_id: userId },
                });

                const userJobTitleData = data.jobtitle_ids.map(
                    (jobTitleId) => ({
                        user_id: userId,
                        jobtitle_id: jobTitleId,
                    })
                );
                await prisma.userJobTitle.createMany({
                    data: userJobTitleData,
                });
            }

            // Fetch updated employee
            const updatedEmployee = await prisma.user.findUnique({
                where: { user_id: userId },
                include: {
                    user_roles: {
                        include: {
                            role: true,
                        },
                    },
                    user_jobtitle: {
                        include: {
                            jobtitle: true,
                        },
                    },
                },
            });

            if (!updatedEmployee) {
                throw new Error("Failed to retrieve updated employee");
            }

            return {
                id: updatedEmployee.user_id,
                first_name: updatedEmployee.first_name,
                last_name: updatedEmployee.last_name,
                email: updatedEmployee.email,
                roles: updatedEmployee.user_roles.map((ur: any) => ({
                    id: ur.role.role_id,
                    name: ur.role.name,
                })),
                job_titles: updatedEmployee.user_jobtitle.map((uj: any) => ({
                    id: uj.jobtitle.jobtitle_id,
                    name: uj.jobtitle.name,
                })),
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
            const userId = employeeId;

            // Check if employee exists
            const existingEmployee = await prisma.user.findUnique({
                where: { user_id: userId },
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

            // Delete user relationships first
            await prisma.userRole.deleteMany({
                where: { user_id: userId },
            });

            await prisma.userJobTitle.deleteMany({
                where: { user_id: userId },
            });

            // Delete the user
            await prisma.user.delete({
                where: { user_id: userId },
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
            const userId = employeeId;

            const employee = await prisma.user.findUnique({
                where: { user_id: userId },
                include: {
                    user_roles: {
                        include: {
                            role: true,
                        },
                    },
                    user_jobtitle: {
                        include: {
                            jobtitle: true,
                        },
                    },
                    indicators: true,
                },
            });

            if (!employee) {
                return null;
            }

            return {
                id: employee.user_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                roles: employee.user_roles.map((ur: any) => ({
                    id: ur.role.role_id,
                    name: ur.role.name,
                })),
                job_titles: employee.user_jobtitle.map((uj: any) => ({
                    id: uj.jobtitle.jobtitle_id,
                    name: uj.jobtitle.name,
                })),
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
