export type Indicator = {
  id: string;
  name: string;
  unit: string;
  target_value: number;
  main_indicator_id: string;
  responsible_user_id: string;
  category_id: string;
  sup_indicators?: SubIndicator[];
};

export type SubIndicator = {
  id: string;
  name: string;
  target_value: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  indicators: Indicator[];
};
