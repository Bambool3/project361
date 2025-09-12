export interface FrequencyPeriod {
    id: string;
    startDate: Date;
    endDate: Date;
}

export interface Frequency {
    id: string;
    name: string;
    type: "standard" | "custom";
    periods: FrequencyPeriod[];
    indicatorCount?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface FrequencyFormData {
    name: string;
    type: "standard" | "custom";
    periods: Omit<FrequencyPeriod, "id">[];
}

export interface FrequencyFilter {
    searchTerm: string;
    type?: "standard" | "custom" | "";
}

export interface FrequencyStats {
    totalFrequencies: number;
    standardFrequencies: number;
    customFrequencies: number;
}

export interface StandardFrequencyTemplate {
    name: string;
    periods: {
        startDate: Date;
        endDate: Date;
    }[];
}
