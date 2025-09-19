export type Category = {
  id: string;
  name: string;
  description: string;
  indicators: Indicator[];
};

// export interface IndicatorSubKpiFormData {
//   id: string;
//   name: string;
//   target: string;
//   position: number;
// }

// // ข้อมูลทั้งหมดที่อยู่ในฟอร์ม KPI
// export interface IndicatorFormData {
//   name: string;
//   target: string;
//   unit: string; // unit_id
//   frequency: string; // frequency_id
//   jobtitle: string[]; // jobtitle_id[]
//   subKpis: IndicatorSubKpiFormData[];
// }
export interface IndicatorSubKpiFormData {
  id: string;
  name: string;
  target_value: string; // แทน target
  position: number;
}

export interface IndicatorFormData {
  name: string;
  target_value: string; // แทน target
  unit_id: string; // แทน unit
  frequency_id: string; // แทน frequency
  jobtitle_ids: string[]; // แทน jobtitle
  sub_indicators: IndicatorSubKpiFormData[]; // แทน subKpis
  category_id: string; // categoryId
}

// types/management.ts
export type ResponsibleJobtitle = {
  in_id: string;
  id: string;
  name: string;
};
export interface IndicatorPayload {
  name: string;
  target_value: number; // หรือ number
  unit_id: string;
  frequency_id: string;
  jobtitle_ids: string[];
  sub_indicators: {
    id: string;
    name: string;
    target_value: number;
    position: number;
  }[];
  category_id: string;
}
export type SubIndicator = {
  id: string;
  name: string;
  target_value?: number | null;
  position: number;
};

export type Frequency = {
  frequency_id: string;
  name: string;
  periods_in_year: number;
};

export type Unit = {
  unit_id: string;
  name: string;
};

export type Indicator = {
  id: string;
  name: string;
  unit: Unit;
  target_value?: number | null;
  main_indicator_id?: string | null;
  responsible_user_id?: string | null;
  responsible_jobtitles: ResponsibleJobtitle[];
  category_id: string;
  frequency: Frequency;
  sub_indicators: SubIndicator[];
};

export type MappedIndicatorData = {
  period_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  actual_value: number | null;
};

export type MappedIndicator = {
  id: string;
  name: string;
  target_value: number | null;
  date: string | null;
  status: string | null;
  position: number;
  main_indicator_id: string | null;
  creator_user_id: string;
  category_id: string;
  // We can even include category info if needed
  category_name: string; 
  unit: string;
  frequency: string;
  responsible_jobtitles: string[];
  sub_indicators: { id: string; name: string }[];
  data: MappedIndicatorData[];
};