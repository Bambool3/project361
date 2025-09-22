export interface FrequencyPeriod {
  period_id: string;
  name: string;
  start_date: string;
  end_date: string;
  notification_date: Date;
  frequency_id: string;
}

export interface Frequency {
  frequency_id: string;
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
    notification_date: Date;
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
    notification_date: Date;
  }[];
}
