import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Developer = {
  id: string;
  name: string;
  logo_url?: string;
  established_date?: string;
  description?: string;
  portfolio?: any[];
  contact_info?: any;
  created_at: string;
  updated_at: string;
};

export type Area = {
  id: string;
  name: string;
  city: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  developer_id?: string;
  area_id?: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  down_payment_min?: number;
  down_payment_max?: number;
  installment_years?: number;
  has_clubhouse?: boolean;
  amenities?: string[];
  unit_types?: string[];
  delivery_date?: string;
  status?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  developer?: Developer;
  area?: Area;
};
