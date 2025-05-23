
// src/lib/xpUtils.js
function getXPLevel(xp) {
  let level = 0;
  let xpThreshold = 100;
  while (xp >= xpThreshold) {
    xp -= xpThreshold;
    level++;
    xpThreshold = Math.floor(xpThreshold * 1.2);
  }
  const totalXP = xp;
  return {
    level,
    minXP: 0,
    maxXP: xpThreshold,
    totalXP
  };
}

module.exports = { getXPLevel };
