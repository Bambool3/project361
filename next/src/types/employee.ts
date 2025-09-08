export interface Department {
    id: string;
    department_name: string;
}

export interface DepartmentFormData {
    name: string;
}

export interface Role {
    id: string;
    role_name: string;
}

export interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
    role_id: string;
    department: Department;
    department_id: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role_id: string;
    department_id: string;
}

export interface EmployeeFilter {
    searchTerm: string;
    departmentId: string;
    roleId?: string;
}

export interface EmployeeStats {
    totalEmployees: number;
    totalDepartments: number;
    activeEmployees: number;
}

export interface ExcelImportResult {
    success: number;
    failed: number;
    errors: string[];
}

export interface ExcelExportData {
    employees: Employee[];
    fileName: string;
}
