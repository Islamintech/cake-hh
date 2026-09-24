// Shared domain types for models, views and controllers.

// ---- Catalog ----

export type Allergen = 'egg' | 'milk' | 'wheat' | 'soy' | 'peanut' | 'tree_nut' | 'peach';

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
  allergens: Allergen[];
  tags: string[];
  dark?: boolean;
  halal?: boolean;
  halalNote?: string;
  gelatin?: boolean;
  /** Only these bakeries stock it; undefined = every bakery. */
  only?: string[];
}

export interface Shape { id: string; name: string }

export interface Size { id: string; name: string; people: string; w: number; price: number; serv: number }

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
  /** Price multiplier applied to the whole cake. */
  mult: number;
  pic: string;
  bg: string;
}

export interface DietaryOption { id: string; label: string }

/** [ingredient a, ingredient b, score, message]. Positive = combo bonus, negative = warning. */
export type Pair = readonly [string, string, number, string];

export interface Preset {
  name: string;
  desc: string;
  batter: string;
  frosting: string;
  toppings: string[];
  tags: string[];
  sweet: number;
}

export type OrderStatus = 'received' | 'accepted' | 'baking' | 'ready' | 'delivering' | 'delivered' | 'pickedup' | 'declined';

export type OptionSet = Set<string>;

// ---- Cake ----

export interface ToppingPlacement { id: string; fx: number; fy: number }

export interface Layer { batter: string; baked: boolean; frosting: string; toppings: ToppingPlacement[] }

export interface CakeDesign { shape: string; size: string; layers: Layer[]; lettering: string }

export interface Pricing { subtotal: number; discount: number; total: number; currency: 'KRW' }

export interface Combo { a: string; b: string; score: number; message: string }

export interface CakeStats {
  kcal: number;
  sugar: number;
  protein: number;
  safe: boolean;
  taste: boolean;
  goal: boolean;
  match: number;
  lowSugar: boolean;
}

export interface Quote extends Pricing { stats: CakeStats; combos: Combo[]; description: string[] }

// ---- Order ----

export type FulfilmentMode = 'pickup' | 'delivery';

export interface Customer { name: string; phone: string; mode: FulfilmentMode; addr: string }

export interface TasteProfile { occasion?: string | null; cravings: string[]; sweet?: number | null }

export interface OrderEvent { status: OrderStatus; actor: string; at: number }

/** Fields computed by prepareNewOrder, ready to store. */
export interface NewOrderFields {
  bakery_id: string;
  cake: CakeDesign;
  options: string[];
  customer: Customer;
  date: string;
  time: string;
  subtotal: number;
  discount: number;
  total: number;
  stats: CakeStats;
  taste_profile: TasteProfile | null;
}

/** A stored order (snake_case mirrors the table). */
export interface OrderRecord extends NewOrderFields {
  id: string;
  code: string;
  tracking_token: string;
  status: OrderStatus;
  photo_url: string | null;
  created_at: number;
  updated_at: number;
  /** Status changes, oldest first. Loaded for single-order reads only. */
  history?: OrderEvent[];
}

// ---- Auth ----

export type Actor = { role: 'admin' } | { role: 'bakery'; bakeryId: string };

// ---- AI suggestions ----

export interface SuggestInput { occasion: string | null; cravings: string[]; sweet: number | null; text: string }

export interface Suggestion { name: string; reason: string; batter: string; frosting: string; toppings: string[] }

export interface SuggestResult { source: 'ai' | 'local'; suggestions: Suggestion[]; note: string }

export interface Suggester {
  enabled: boolean;
  suggest(input: SuggestInput, opts: OptionSet): Promise<SuggestResult>;
}

// ---- Infrastructure ----

export type Logger = Partial<Pick<Console, 'info' | 'warn' | 'error'>>;

export interface AppConfig {
  isProd: boolean;
  port: number;
  host: string;
  dbPath: string;
  corsOrigins: string[];
  trustProxy: boolean;
  anthropicApiKey: string;
  anthropicModel: string;
  aiTimeoutMs: number;
  adminKey: string;
  bakeryKeys: Record<string, string>;
  usingDevKeys: boolean;
  /** Tests: silence the access log. */
  quiet?: boolean;
  /** Tests: turn rate limiting off. */
  disableRateLimit?: boolean;
}

export interface OrderEvents {
  publish(order: OrderRecord): void;
  subscribe(fn: (order: OrderRecord) => void): () => void;
}

// req.actor is set by the requireBakery middleware.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: Actor;
    }
  }
}
