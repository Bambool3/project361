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

export type Indicator = {
  id: string;
  name: string;
  unit?: string | null;
  target_value?: number | null;
  main_indicator_id?: number | null;
  responsible_user_id?: number | null;
  responsible_jobtitles: ResponsibleJobtitle[];
  category_id: number;
  frequency?: string | null;
  sub_indicators: SubIndicator[];
};
