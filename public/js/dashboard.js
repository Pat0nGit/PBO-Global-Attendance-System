function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

function toPHTimeString(dateStr, isTimeOnly = false) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return isTimeOnly
    ? utc8.toLocaleTimeString("en-GB", { hour12: false })
    : utc8.toISOString().split("T")[0];
}

function showDigitalClock() {
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
  requestAnimationFrame(showDigitalClock);
}

function animateAnalogClock() {
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = now.getHours() + min / 60;

  document.querySelector(
    ".hand.second"
  ).style.transform = `translateX(-50%) rotate(${sec * 6}deg)`;
  document.querySelector(
    ".hand.minute"
  ).style.transform = `translateX(-50%) rotate(${min * 6}deg)`;
  document.querySelector(
    ".hand.hour"
  ).style.transform = `translateX(-50%) rotate(${hr * 30}deg)`;

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
          <td>${toPHTimeString(log.date)}</td>
          <td>${toPHTimeString(log.time_in, true)}</td>
          <td>${toPHTimeString(log.time_out, true)}</td>
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
    const url = URL.createObjectURL(blob);
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

function openLeaveForm() {
  document.getElementById("leaveModal").classList.remove("hidden");
}

function closeLeaveForm() {
  document.getElementById("leaveModal").classList.add("hidden");
}

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

document
  .getElementById("timeInBtn")
  ?.addEventListener("click", () => timePunch("time-in"));
document
  .getElementById("timeOutBtn")
  ?.addEventListener("click", () => timePunch("time-out"));
document.getElementById("exportBtn")?.addEventListener("click", exportCSV);

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "night-toggle";
  toggleBtn.textContent = " Night Mode";
  toggleBtn.onclick = () => {
    document.body.classList.toggle("night-mode");
    toggleBtn.textContent = document.body.classList.contains("night-mode")
      ? " Light Mode"
      : " Night Mode";
  };
  document.body.appendChild(toggleBtn);
});

getUserInfo();
fetchLogs();
showDigitalClock();
animateAnalogClock();
