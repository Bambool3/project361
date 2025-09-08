import { Employee, EmployeeFormData, Department, Role } from "@/types/employee";

export class EmployeeService {
    private static baseUrl = "/api/employee";

    static async getEmployees(): Promise<Employee[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch employees: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    }

    static async createEmployeeWithStatus(
        data: EmployeeFormData
    ): Promise<number> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            return response.status;
        } catch (error) {
            console.error("Error creating employee:", error);
            return 500;
        }
    }

    static async updateEmployeeWithStatus(
        id: string,
        data: EmployeeFormData
    ): Promise<number> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            return response.status;
        } catch (error) {
            console.error("Error updating employee:", error);
            return 500;
        }
    }

    static async getDepartments(): Promise<Department[]> {
        try {
            const response = await fetch("/api/departments", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch departments: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching departments:", error);
            throw error;
        }
    }

    static async getRoles(): Promise<Role[]> {
        try {
            const response = await fetch("/api/roles", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch roles: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    }
}
