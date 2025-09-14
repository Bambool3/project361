export type Category = {
  id: string;
  name: string;
  description: string;
  indicators: Indicator[];
};

export type IndicatorFormDaTa = {};

// types/management.ts
export type ResponsibleJobtitle = {
  in_id: number;
  id: number;
  name: string;
};

export type SubIndicator = {
  id: number;
  name: string;
  target_value?: number | null;
};

export type Frequency = {
  frequency_id: number;
  name: string;
  periods_in_year: number;
};

export type Unit = {
  unit_id: number;
  name: string;
};

export type Indicator = {
  id: string;
  name: string;
  unit: Unit;
  target_value?: number | null;
  main_indicator_id?: number | null;
  responsible_user_id?: number | null;
  responsible_jobtitles: ResponsibleJobtitle[];
  category_id: number;
  frequency: Frequency;
  sub_indicators: SubIndicator[];
};
