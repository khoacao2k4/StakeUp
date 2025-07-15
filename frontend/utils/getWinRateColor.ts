export default function getWinRateColor(winRate: number | null): string {
  // Default to a neutral color if winRate is not a valid number
  if (winRate === null || isNaN(winRate)) {
    return '#6B7280'; // Gray for N/A
  }

  // Define our color points
  const red = { r: 239, g: 68, b: 68 };     // #EF4444
  const yellow = { r: 234, g: 179, b: 8 }; // #EAB308
  const green = { r: 16, g: 185, b: 129 };  // #10B981

  let r, g, b;

  if (winRate < 50) {
    // Interpolate from Red to Yellow
    const ratio = winRate / 50;
    r = Math.round(red.r + (yellow.r - red.r) * ratio);
    g = Math.round(red.g + (yellow.g - red.g) * ratio);
    b = Math.round(red.b + (yellow.b - red.b) * ratio);
  } else {
    // Interpolate from Yellow to Green
    const ratio = (winRate - 50) / 50;
    r = Math.round(yellow.r + (green.r - yellow.r) * ratio);
    g = Math.round(yellow.g + (green.g - yellow.g) * ratio);
    b = Math.round(yellow.b + (green.b - yellow.b) * ratio);
  }

  return `rgb(${r}, ${g}, ${b})`;
};