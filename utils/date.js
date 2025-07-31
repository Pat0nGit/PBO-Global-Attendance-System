function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeHours(timeIn, timeOut) {
  const [h1, m1, s1] = timeIn.split(":").map(Number);
  const [h2, m2, s2] = timeOut.split(":").map(Number);

  const start = h1 * 3600 + m1 * 60 + s1;
  const end = h2 * 3600 + m2 * 60 + s2;
  const hours = (end - start) / 3600;

  return Math.max(hours, 0); // Optional: subtract 1 for lunch break
}

module.exports = {
  formatDate,
  computeHours,
};
