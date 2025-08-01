function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

// 12-hour digital clock
function showClock() {
  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "en-US",
    options
  );
  requestAnimationFrame(showClock);
}

// Analog clock with smooth rotation
function animateAnalogClock() {
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  const secondDeg = sec * 6;
  const minuteDeg = min * 6;
  const hourDeg = hr * 30;

  document.querySelector(
    ".hand.second"
  ).style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
  document.querySelector(
    ".hand.minute"
  ).style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  document.querySelector(
    ".hand.hour"
  ).style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

  requestAnimationFrame(animateAnalogClock);
}

function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return logout();

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    document.getElementById("username").textContent = payload.name || "User";
    return payload;
  } catch (err) {
    console.error("Invalid token format");
    logout();
  }
}

// Adjust UTC time to PH time (UTC+8)
function toPHT(time) {
  if (!time) return "-";
  const date = new Date(time + "Z");
  return date.toLocaleTimeString("en-PH", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  });
}

// Fetch and display logs
async function fetchLogs() {
  const token = localStorage.getItem("token");
  if (!token) return logout();

  try {
    const res = await fetch("/api/logs/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logs = await res.json();

    const rows = logs
      .map(
        (log) => `
      <tr>
        <td>${log.date}</td>
        <td>${toPHT(log.time_in)}</td>
        <td>${toPHT(log.time_out)}</td>
        <td>${log.hours?.toFixed(2) || "0.00"}</td>
      </tr>
    `
      )
      .join("");

    document.getElementById("logRows").innerHTML = rows;
  } catch (err) {
    alert("Failed to load logs.");
    console.error(err);
  }
}

// Time punch
async function timePunch(type) {
  const token = localStorage.getItem("token");
  if (!token) return logout();

  try {
    const res = await fetch(`/api/logs/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert(`${type.replace("-", " ").toUpperCase()} successful`);
      fetchLogs();
    } else {
      alert(data.error || "Something went wrong");
    }
  } catch (err) {
    alert("Failed to record time.");
    console.error(err);
  }
}

// Export logs
async function exportCSV() {
  const token = localStorage.getItem("token");
  if (!token) return logout();

  try {
    const res = await fetch("/api/logs/export/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || "Export failed.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_logs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Export failed.");
    console.error(err);
  }
}

// Leave form
function openLeaveForm() {
  document.getElementById("leaveModal").classList.remove("hidden");
}
function closeLeaveForm() {
  document.getElementById("leaveModal").classList.add("hidden");
}

// Submit leave
document.getElementById("leaveForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return logout();

  const reason = document.getElementById("reason").value.trim();
  const from_date = document.getElementById("from_date").value;
  const to_date = document.getElementById("to_date").value;

  const body = { reason, from_date };
  if (to_date) body.to_date = to_date;

  try {
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Leave request submitted.");
      document.getElementById("leaveForm").reset();
      closeLeaveForm();
    } else {
      alert(data.error || "Failed to submit leave.");
    }
  } catch (err) {
    alert("Request failed.");
    console.error(err);
  }
});

// Events
document
  .getElementById("timeInBtn")
  .addEventListener("click", () => timePunch("time-in"));
document
  .getElementById("timeOutBtn")
  .addEventListener("click", () => timePunch("time-out"));
document.getElementById("exportBtn").addEventListener("click", exportCSV);

// Init
document.addEventListener("DOMContentLoaded", () => {
  showClock();
  animateAnalogClock();
  getUserInfo();
  fetchLogs();
});
