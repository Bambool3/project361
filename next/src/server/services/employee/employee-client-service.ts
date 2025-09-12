import { Employee, EmployeeFormData, JobTitle, Role } from "@/types/employee";

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

    static async getJobTitles(): Promise<JobTitle[]> {
        try {
            const response = await fetch("/api/jobTitle", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch job titles: ${response.statusText}`
                );
            }

            const data = await response.json();
            return data.map((item: any) => ({
                id: item.id,
                name: item.jobTitle_name,
            }));
        } catch (error) {
            console.error("Error fetching job titles:", error);
            throw error;
        }
    }

    static async getRoles(): Promise<Role[]> {
        try {
            const response = await fetch("/api/role", {
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

            const data = await response.json();
            return data.map((item: any) => ({
                id: item.id,
                name: item.role_name,
            }));
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    }
}
