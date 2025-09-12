export interface FrequencyPeriod {
    period_id: number;
    start_date: string;
    end_date: string;
    frequency_id: number;
}

export interface Frequency {
    frequency_id: number;
    name: string;
    periods: FrequencyPeriod[];
    indicatorCount?: number;
}

export interface FrequencyFormData {
    name: string;
    periods: {
        startDate: Date;
        endDate: Date;
    }[];
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
