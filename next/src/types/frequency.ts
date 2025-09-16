export interface FrequencyPeriod {
    period_id: number;
    name: string;
    start_date: string;
    end_date: string;
    frequency_id: number;
}

export interface Frequency {
    frequency_id: number;
    name: string;
    periods: FrequencyPeriod[];
    periods_in_year?: number;
    indicatorCount?: number;
}

export interface FrequencyFormData {
    name: string;
    periods: {
        name: string;
        startDate: Date;
        endDate: Date;
    }[];
    periods_in_year?: number;
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
        name: string;
        startDate: Date;
        endDate: Date;
    }[];
}
