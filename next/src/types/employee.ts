export interface JobTitle {
    id: string;
    name: string;
}

export interface JobTitleFormData {
    name: string;
}

export interface Role {
    id: string;
    name: string;
}

export interface Employee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: Role[];
    job_titles: JobTitle[];
    created_at?: Date;
    updated_at?: Date;
}

export interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role_ids: string[];
    jobtitle_ids: string[];
}

export interface EmployeeFilter {
    searchTerm: string;
    jobTitleId: string;
    roleId?: string;
}

export interface EmployeeStats {
    totalEmployees: number;
    totalJobTitles: number;
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
