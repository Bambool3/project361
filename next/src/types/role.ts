export interface Role {
    id: string;
    name: string;
    employeeCount?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface RoleFormData {
    name: string;
}

export interface RoleFilter {
    searchTerm: string;
}

export interface RoleStats {
    totalRoles: number;
    activeRoles: number;
}

export interface ExcelImportResult {
    success: number;
    failed: number;
    errors: string[];
}
