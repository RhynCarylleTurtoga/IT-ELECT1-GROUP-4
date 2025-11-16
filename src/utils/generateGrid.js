// src/utils/generateGrid.js
export default function generateGrid(gridSize) {
  try {
    const count = gridSize * gridSize;
    const arr = [];
    for (let i = 1; i <= count; i++) arr.push(i);

    // Shuffle numbers (Fisher-Yates)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  } catch (e) {
    console.warn("generateGrid error", e);
    return [];
  }
}