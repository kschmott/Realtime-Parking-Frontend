export interface Point {
  x: number;
  y: number;
}

export interface Spot {
  id: number;
  imageIndex: number;
  points: Point[];
  location?: { lng: number; lat: number } | null; // Optional location property
  parkingLotName?: string;
  openingHours?: string;
  price?: string;
}

