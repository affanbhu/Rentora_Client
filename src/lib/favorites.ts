
export interface FavoriteEquipment {
  _id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  dailyRate: number;
  location: string;
  imageUrl: string;
  availability: string;
}

const STORAGE_KEY = "rentora-favorites";

export function getFavorites(): FavoriteEquipment[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items: FavoriteEquipment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function toggleFavorite(item: FavoriteEquipment): FavoriteEquipment[] {
  const favorites = getFavorites();
  const exists = favorites.some((favorite) => favorite._id === item._id);

  const updated = exists
    ? favorites.filter((favorite) => favorite._id !== item._id)
    : [...favorites, item];

  saveFavorites(updated);
  return updated;
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((item) => item._id === id);
}
