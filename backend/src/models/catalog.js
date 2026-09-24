// Static catalog, ported 1:1 from demo/cake-kitchen-demo.html so prices and rules match the UI.
// Prices are in KRW. `only` limits an ingredient to specific bakeries.

export const SHAPES = [
  { id: 'round', name: 'Round' },
  { id: 'square', name: 'Square' },
  { id: 'heart', name: 'Heart' },
];

export const SIZES = [
  { id: 's', name: 'Small', people: '4–6 people', w: 150, price: 28000, serv: 5 },
  { id: 'm', name: 'Medium', people: '8–10 people', w: 186, price: 39000, serv: 9 },
  { id: 'l', name: 'Large', people: '12+ people', w: 218, price: 52000, serv: 13 },
];

export const BATTERS = [
  { id: 'vanilla', name: 'Vanilla', ko: '바닐라', color: '#F2D69B', price: 0, kcal: 260, sugar: 22, protein: 5, allergens: ['egg', 'milk', 'wheat'], tags: ['classic', 'creamy'] },
  { id: 'chocolate', name: 'Chocolate', ko: '초코', color: '#6A3A28', price: 3000, kcal: 290, sugar: 24, protein: 5, allergens: ['egg', 'milk', 'wheat', 'soy'], tags: ['chocolatey'], dark: true },
  { id: 'matcha', name: 'Matcha', ko: '말차', color: '#93B55E', price: 4000, kcal: 250, sugar: 18, protein: 5, allergens: ['egg', 'milk', 'wheat'], tags: ['fresh', 'korean'] },
  { id: 'redvelvet', name: 'Red velvet', ko: '레드벨벳', color: '#B0303B', price: 4000, kcal: 280, sugar: 24, protein: 5, allergens: ['egg', 'milk', 'wheat'], tags: ['classic'], dark: true },
  { id: 'goguma', name: 'Sweet potato', ko: '고구마', color: '#E3A456', price: 4000, kcal: 240, sugar: 17, protein: 4, allergens: ['egg', 'milk', 'wheat'], tags: ['korean', 'nutty', 'creamy'] },
  { id: 'rice', name: 'Rice flour', ko: '쌀 (no wheat)', color: '#F3ECDC', price: 5000, kcal: 230, sugar: 16, protein: 4, allergens: ['egg', 'milk'], tags: ['light', 'korean'] },
  { id: 'oat', name: 'Vegan oat', ko: '비건 오트', color: '#D6C095', price: 5000, kcal: 220, sugar: 14, protein: 6, allergens: ['wheat'], tags: ['light', 'fresh'], only: ['s1', 's2'] },
];

export const FROSTINGS = [
  { id: 'whip', name: 'Whipped cream', ko: '생크림', color: '#FFFBF4', price: 0, kcal: 120, sugar: 8, protein: 1, allergens: ['milk'], tags: ['creamy', 'light', 'classic'] },
  { id: 'cheese', name: 'Cream cheese', ko: '크림치즈', color: '#FAEFD6', price: 3000, kcal: 150, sugar: 10, protein: 3, allergens: ['milk'], tags: ['creamy', 'classic'] },
  { id: 'ganache', name: 'Choco ganache', ko: '가나슈', color: '#4A2A1E', price: 3000, kcal: 170, sugar: 14, protein: 2, allergens: ['milk', 'soy'], tags: ['chocolatey'] },
  { id: 'berry', name: 'Strawberry cream', ko: '딸기 크림', color: '#F6B3C6', price: 3000, kcal: 130, sugar: 11, protein: 1, allergens: ['milk'], tags: ['fruity', 'creamy'] },
  { id: 'yogurt', name: 'Greek yogurt', ko: '요거트', color: '#F7F4EC', price: 4000, kcal: 90, sugar: 5, protein: 7, allergens: ['milk'], tags: ['light', 'fresh'] },
  { id: 'coconut', name: 'Coconut cream', ko: '코코넛 (vegan)', color: '#EFEBDD', price: 4000, kcal: 140, sugar: 6, protein: 1, allergens: [], tags: ['light', 'fresh'], only: ['s1', 's2'] },
  { id: 'rum', name: 'Rum buttercream', ko: '럼 버터', color: '#EFD6A0', price: 4000, kcal: 190, sugar: 15, protein: 1, allergens: ['milk'], halal: false, halalNote: 'Contains rum (alcohol), so it is not halal.', tags: ['creamy'], only: ['s3'] },
];

export const TOPPINGS = [
  { id: 'straw', e: '🍓', name: 'Strawberry', price: 1500, kcal: 4, sugar: 1, protein: 0, allergens: [], tags: ['fruity'] },
  { id: 'blue', e: '🫐', name: 'Blueberries', price: 1500, kcal: 3, sugar: 1, protein: 0, allergens: [], tags: ['fruity', 'fresh'] },
  { id: 'cherry', e: '🍒', name: 'Cherry', price: 1500, kcal: 5, sugar: 1, protein: 0, allergens: [], tags: ['fruity'] },
  { id: 'kiwi', e: '🥝', name: 'Kiwi', price: 1500, kcal: 4, sugar: 1, protein: 0, allergens: [], tags: ['fresh', 'fruity'] },
  { id: 'peach', e: '🍑', name: 'Peach', price: 1500, kcal: 5, sugar: 1, protein: 0, allergens: ['peach'], tags: ['fruity'] },
  { id: 'yuja', e: '🍋', name: 'Yuja peel', price: 1500, kcal: 3, sugar: 1, protein: 0, allergens: [], tags: ['fresh', 'korean'] },
  { id: 'choc', e: '🍫', name: 'Chocolate', price: 1000, kcal: 25, sugar: 3, protein: 0, allergens: ['milk', 'soy'], tags: ['chocolatey'] },
  { id: 'cookie', e: '🍪', name: 'Cookie', price: 1000, kcal: 30, sugar: 3, protein: 0, allergens: ['wheat', 'egg', 'milk'], tags: ['classic'] },
  { id: 'peanut', e: '🥜', name: 'Peanuts', price: 1000, kcal: 20, sugar: 0, protein: 1, allergens: ['peanut'], tags: ['nutty'] },
  { id: 'mint', e: '🌿', name: 'Mint leaf', price: 500, kcal: 0, sugar: 0, protein: 0, allergens: [], tags: ['fresh'] },
  { id: 'star', e: '⭐', name: 'Sugar star', price: 800, kcal: 10, sugar: 3, protein: 0, allergens: [], tags: [] },
  { id: 'gummy', e: '🍬', name: 'Gummy candy', price: 800, kcal: 15, sugar: 4, protein: 0, allergens: [], gelatin: true, halal: false, halalNote: 'Made with pork gelatin, so it is not halal.', tags: [], only: ['s3'] },
  { id: 'candle', e: '🕯️', name: 'Candle', price: 500, kcal: 0, sugar: 0, protein: 0, allergens: [], tags: [] },
];

export const ALL = Object.fromEntries([...BATTERS, ...FROSTINGS, ...TOPPINGS].map((x) => [x.id, x]));

export const BAKERIES = [
  { id: 's1', name: 'Seoul Sugar Studio', area: 'Mapo-gu', trust: 'verified', halal: true, maxLayers: 3, delivery: true, pickup: true, lead: 'Tomorrow', leadDays: 1, mult: 1, pic: '🧁', bg: '#FFE1EC' },
  { id: 's2', name: 'Itaewon Crumb House', area: 'Yongsan-gu', trust: 'self', halal: true, maxLayers: 2, delivery: false, pickup: true, lead: 'In 2 days', leadDays: 2, mult: 0.95, pic: '🥐', bg: '#FFF1C9' },
  { id: 's3', name: 'Bora Bakehouse', area: 'Seongsu-dong', trust: 'none', halal: false, maxLayers: 3, delivery: true, pickup: true, lead: 'Tomorrow', leadDays: 1, mult: 1.05, pic: '🍰', bg: '#E2F5EC' },
];

export const OPTIONS = [
  { id: 'halal', label: 'Halal' },
  { id: 'no_milk', label: 'No milk' },
  { id: 'no_egg', label: 'No egg' },
  { id: 'no_nuts', label: 'No nuts' },
  { id: 'no_wheat', label: 'No wheat' },
  { id: 'low_sugar', label: 'Low sugar' },
  { id: 'vegan', label: 'Vegan' },
];

// [a, b, score, message]. Positive = combo bonus, negative = warning.
export const PAIRS = [
  ['straw', 'cheese', 2, 'Strawberry + cream cheese. A classic combo!'],
  ['chocolate', 'cherry', 2, 'Chocolate and cherry, like a Black Forest cake!'],
  ['ganache', 'straw', 2, 'Chocolate-dipped strawberry vibes. Lovely.'],
  ['matcha', 'whip', 2, 'Matcha with light cream, very Seoul café.'],
  ['goguma', 'whip', 2, 'Sweet potato and cream, just like 고구마 케이크.'],
  ['redvelvet', 'cheese', 2, 'Red velvet belongs with cream cheese.'],
  ['yuja', 'yogurt', 2, 'Yuja and yogurt: fresh and not too sweet.'],
  ['chocolate', 'peanut', 1, 'Chocolate and peanut. Protein bonus!'],
  ['matcha', 'straw', 1, 'Matcha and strawberry look beautiful together.'],
  ['yuja', 'whip', -1, 'Yuja can curdle milk cream, dear. Try yogurt or coconut cream.'],
  ['kiwi', 'whip', -1, 'Kiwi makes milk cream bitter over time. Coconut cream is safer.'],
];

export const PRESETS = [
  { name: 'Strawberry Cloud', desc: 'Soft vanilla sponge, fresh cream and a crown of strawberries.', batter: 'vanilla', frosting: 'whip', toppings: ['straw', 'straw', 'straw', 'straw', 'mint'], tags: ['fruity', 'light', 'classic', 'creamy'], sweet: 2 },
  { name: 'Seoul Matcha Garden', desc: 'Earthy matcha with light cream and strawberries, like a Seongsu café.', batter: 'matcha', frosting: 'whip', toppings: ['straw', 'straw', 'mint', 'star'], tags: ['fresh', 'korean', 'light'], sweet: 1 },
  { name: 'Midnight Chocolate', desc: 'Rich chocolate with ganache and cherries, Black Forest style.', batter: 'chocolate', frosting: 'ganache', toppings: ['cherry', 'cherry', 'cherry', 'choc'], tags: ['chocolatey'], sweet: 3 },
  { name: 'Goguma Hug', desc: 'Cozy Korean sweet potato cake with cream and roasted peanuts.', batter: 'goguma', frosting: 'whip', toppings: ['peanut', 'peanut', 'star'], tags: ['korean', 'nutty', 'creamy'], sweet: 2 },
  { name: 'Yuja Sunshine', desc: 'Rice sponge, tangy yogurt cream and bright yuja peel.', batter: 'rice', frosting: 'yogurt', toppings: ['yuja', 'yuja', 'mint', 'blue'], tags: ['fresh', 'light', 'korean', 'fruity'], sweet: 1 },
  { name: 'Velvet Crush', desc: 'Red velvet and cream cheese with berries on top.', batter: 'redvelvet', frosting: 'cheese', toppings: ['straw', 'blue', 'star'], tags: ['classic', 'creamy'], sweet: 3 },
  { name: 'Berry Garden (vegan)', desc: 'Oat sponge, coconut cream and a pile of fresh fruit.', batter: 'oat', frosting: 'coconut', toppings: ['blue', 'straw', 'kiwi', 'mint'], tags: ['fruity', 'fresh', 'light'], sweet: 1 },
];

export const OCCASIONS = ['Birthday', 'Anniversary', 'Just for me', 'Office party'];
export const CRAVINGS = [['fruity', 'Fruity'], ['chocolatey', 'Chocolatey'], ['creamy', 'Creamy'], ['nutty', 'Nutty'], ['fresh', 'Fresh & light'], ['korean', 'Korean taste']];
export const SWEET = [[1, 'Light'], [2, 'Medium'], [3, 'Very sweet']];

export const GUEST_DISCOUNT = 0.1;
export const EXTRA_LAYER_PRICE = 15000;
export const LETTERING_PRICE = 2000;
export const MAX_TOPPINGS_PER_LAYER = 12;
export const MAX_LETTERING = 18;
export const TIME_SLOTS = ['11:00', '13:00', '15:00', '17:00', '19:00'];
export const MAX_DAYS_AHEAD = 60;
export const TIMEZONE = 'Asia/Seoul';

export const STEPS_PICKUP = [['received', 'Order received'], ['accepted', 'Bakery accepted'], ['baking', 'Baking now'], ['ready', 'Ready'], ['pickedup', 'Picked up']];
export const STEPS_DELIVERY = [['received', 'Order received'], ['accepted', 'Bakery accepted'], ['baking', 'Baking now'], ['ready', 'Ready'], ['delivering', 'On the way'], ['delivered', 'Delivered']];
export const ORDER_STATUSES = ['received', 'accepted', 'baking', 'ready', 'delivering', 'delivered', 'pickedup', 'declined'];

export function bakeryById(id) {
  return BAKERIES.find((b) => b.id === id) || null;
}
