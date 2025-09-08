export type Indicator = {
    id: string;
    name: string;
    unit: string;
    target_value: number;
    main_indicator_id: string;
    responsible_user_id: string;
    category_id: string;
};

export type Category = {
    id: string;
    name: string;
    description: string;
    indicators: Indicator[];
};

export interface KPI {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    target?: number;
    current?: number;
    unit?: string;
    status?: "on-track" | "at-risk" | "off-track" | "completed";
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryFormData {
    name: string;
    description: string;
}

export interface CategoryStats {
    totalKPIs: number;
    totalCategories: number;
    onTrack?: number;
    atRisk?: number;
    offTrack?: number;
    completed?: number;
}
