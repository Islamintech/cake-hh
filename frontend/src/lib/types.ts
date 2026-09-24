// Shapes of the backend's JSON responses (see backend/src/views).

export interface Ingredient {
  id: string;
  name: string;
  ko?: string;
  color?: string;
  /** Emoji, for toppings. */
  e?: string;
  price: number;
  kcal: number;
  sugar: number;
  protein: number;
  allergens: string[];
  tags: string[];
  dark?: boolean;
  halal?: boolean;
  halalNote?: string;
  gelatin?: boolean;
  /** Bakery ids that stock it; null = every bakery. */
  bakeries: string[] | null;
}

export interface MenuItem extends Omit<Ingredient, 'bakeries'> {
  /** Why it can't be picked with the chosen options, or null. */
  locked: string | null;
}

export interface Shape { id: string; name: string }
export interface Size { id: string; name: string; people: string; w: number; price: number; serv: number }
export interface DietaryOption { id: string; label: string }
export interface Pair { a: string; b: string; score: number; message: string }
export interface Preset { name: string; desc: string; batter: string; frosting: string; toppings: string[]; tags: string[]; sweet: number }

export interface Catalog {
  shapes: Shape[];
  sizes: Size[];
  batters: Ingredient[];
  frostings: Ingredient[];
  toppings: Ingredient[];
  options: DietaryOption[];
  pairs: Pair[];
  presets: Preset[];
  occasions: string[];
  cravings: { id: string; label: string }[];
  sweetness: { value: number; label: string }[];
  timeSlots: string[];
  rules: {
    guestDiscount: number;
    extraLayerPrice: number;
    letteringPrice: number;
    maxToppingsPerLayer: number;
    maxLettering: number;
    maxDaysAhead: number;
    currency: 'KRW';
    timezone: string;
  };
}

export type TrustLevel = 'verified' | 'self' | 'none';

export interface Bakery {
  id: string;
  name: string;
  area: string;
  trust: TrustLevel;
  halal: boolean;
  maxLayers: number;
  delivery: boolean;
  pickup: boolean;
  lead: string;
  leadDays: number;
  mult: number;
  pic: string;
  bg: string;
  fromPrice: number;
  earliestDate: string;
  notice: string | null;
  fits: boolean;
}

export interface BakeryDetail extends Bakery {
  menu: { batters: MenuItem[]; frostings: MenuItem[]; toppings: MenuItem[] };
}

// ---- Cake ----

export interface ToppingPlacement { id: string; fx: number; fy: number }
export interface Layer { batter: string | null; baked: boolean; frosting: string | null; toppings: ToppingPlacement[] }
export interface CakeDesign { shape: string | null; size: string | null; layers: Layer[]; lettering: string }

export interface CakeStats { kcal: number; sugar: number; protein: number; safe: boolean; taste: boolean; goal: boolean; match: number; lowSugar: boolean }

export interface Quote {
  bakeryId: string;
  cake: CakeDesign;
  subtotal: number;
  discount: number;
  total: number;
  currency: 'KRW';
  stats: CakeStats;
  combos: Pair[];
  description: string[];
}

export interface Suggestion { name: string; reason: string; batter: string; frosting: string; toppings: string[] }
export interface SuggestResponse { options: string[]; source: 'ai' | 'local'; suggestions: Suggestion[]; note: string }

// ---- Orders ----

export type OrderStatus = 'received' | 'accepted' | 'baking' | 'ready' | 'delivering' | 'delivered' | 'pickedup' | 'declined';
export type FulfilmentMode = 'pickup' | 'delivery';

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  bakeryId: string;
  bakeryName: string;
  cake: CakeDesign;
  description: string[];
  options: string[];
  customer: { name: string; phone: string; mode: FulfilmentMode; addr: string };
  date: string;
  time: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: 'KRW';
  stats: CakeStats;
  photo: boolean;
  photoUrl: string | null;
  steps: { id: OrderStatus; label: string }[];
  history?: { status: OrderStatus; actor: string; at: number }[];
  nextStatuses?: OrderStatus[];
}

export interface PlaceOrderBody {
  bakeryId: string;
  cake: CakeDesign;
  options: string[];
  customer: { name: string; phone: string; mode: FulfilmentMode; addr: string };
  date: string;
  time: string;
  tasteProfile?: { occasion: string | null; cravings: string[]; sweet: number | null };
}

export type Staff = { role: 'admin'; bakeries: Bakery[] } | { role: 'bakery'; bakery: Bakery };
