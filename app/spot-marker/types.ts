// types.ts

export interface Point {
  x: number;
  y: number;
}

export interface Spot {
  id: number;
  imageIndex: number;
  points: Point[];
}
