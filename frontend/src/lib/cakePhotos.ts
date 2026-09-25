// Real photos for the house cakes (catalog presets), keyed by preset name.
// Cakes built in the kitchen have no photo and keep their drawing.
// Photos: Unsplash (free to use under the Unsplash License); sources listed in frontend/README.md.

export interface CakePhoto { src: string; position?: string }

const PHOTOS: Record<string, CakePhoto> = {
  'Strawberry Cloud': { src: '/cakes/strawberry-cloud.jpg' },
  'Seoul Matcha Garden': { src: '/cakes/seoul-matcha-garden.jpg' },
  'Midnight Chocolate': { src: '/cakes/midnight-chocolate.jpg' },
  'Goguma Hug': { src: '/cakes/goguma-hug.jpg', position: '50% 80%' },
  'Yuja Sunshine': { src: '/cakes/yuja-sunshine.jpg' },
  'Velvet Crush': { src: '/cakes/velvet-crush.jpg' },
  'Berry Garden (vegan)': { src: '/cakes/berry-garden.jpg' },
};

export const cakePhoto = (name: string | null | undefined): CakePhoto | null => (name && PHOTOS[name]) || null;
