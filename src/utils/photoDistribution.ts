import { PhotoItem } from '../types';

/**
 * Distribute n photos into 3 balanced rows:
 * - 10 photos: 3 - 4 - 3
 * - 30 photos: 10 - 10 - 10
 * - Any other count: nearly equal distribution, difference at most 1
 */
export function distributePhotosToThreeRows(photos: PhotoItem[]): [PhotoItem[], PhotoItem[], PhotoItem[]] {
  const n = photos.length;
  if (n === 0) return [[], [], []];
  if (n === 1) return [[photos[0]], [], []];
  if (n === 2) return [[photos[0]], [photos[1]], []];
  if (n === 3) return [[photos[0]], [photos[1]], [photos[2]]];

  const base = Math.floor(n / 3);
  const rem = n % 3;

  let c1 = base;
  let c2 = base;
  let c3 = base;

  if (rem === 1) {
    // 10 -> 3 - 4 - 3
    c2 += 1;
  } else if (rem === 2) {
    // 5 -> 2 - 1 - 2; 8 -> 3 - 2 - 3
    c1 += 1;
    c3 += 1;
  }

  return [
    photos.slice(0, c1),
    photos.slice(c1, c1 + c2),
    photos.slice(c1 + c2, c1 + c2 + c3),
  ];
}
