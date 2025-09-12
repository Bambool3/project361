export interface Job {
    id: string;
    name: string;
    employeeCount?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface JobFormData {
    name: string;
}

export interface JobFilter {
    searchTerm: string;
}

export interface JobStats {
    totalJobs: number;
    activeJobs: number;
}

export interface ExcelImportResult {
    success: number;
    failed: number;
    errors: string[];
}
