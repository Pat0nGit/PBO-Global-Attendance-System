function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime24to12(timeStr) {
  const [hour, min, sec] = timeStr.split(":");
  const h = parseInt(hour);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${min} ${suffix}`;
}
