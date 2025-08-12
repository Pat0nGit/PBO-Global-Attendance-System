function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

function showClock() {
  const now = new Date();
  const options = { timeZone: "Asia/Manila", hour12: false };
  const time = now.toLocaleTimeString("en-PH", options);
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = time;
  requestAnimationFrame(showClock);
}

// Smooth Analog Clock - PH Time
function updateAnalogClock() {
  const now = new Date();

  // Get PH time without manual UTC math
  const options = { timeZone: "Asia/Manila" };
  const phHours = parseInt(
    now.toLocaleString("en-PH", { ...options, hour: "numeric", hour12: false })
  );
  const phMinutes = parseInt(
    now.toLocaleString("en-PH", { ...options, minute: "numeric" })
  );
  const phSeconds = parseInt(
    now.toLocaleString("en-PH", { ...options, second: "numeric" })
  );
  const phMilliseconds = now.getMilliseconds();

  // Smooth rotation
  const hourDeg = ((phHours % 12) + phMinutes / 60 + phSeconds / 3600) * 30;
  const minuteDeg = (phMinutes + phSeconds / 60) * 6;
  const secondDeg = (phSeconds + phMilliseconds / 1000) * 6;

  document.querySelector(
    ".hand.hour"
  ).style.transform = `rotate(${hourDeg}deg)`;
  document.querySelector(
    ".hand.minute"
  ).style.transform = `rotate(${minuteDeg}deg)`;
  document.querySelector(
    ".hand.second"
  ).style.transform = `rotate(${secondDeg}deg)`;

  requestAnimationFrame(updateAnalogClock);
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
      .map((log) => {
        const date = log.date;
        const timeIn = log.time_in
          ? new Date(`1970-01-01T${log.time_in}Z`).toLocaleTimeString("en-PH", {
              hour12: false,
            })
          : "-";
        const timeOut = log.time_out
          ? new Date(`1970-01-01T${log.time_out}Z`).toLocaleTimeString(
              "en-PH",
              { hour12: false }
            )
          : "-";

        return `
        <tr>
          <td>${date}</td>
          <td>${timeIn}</td>
          <td>${timeOut}</td>
          <td>${log.hours?.toFixed(2) || "0.00"}</td>
        </tr>`;
      })
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

  updateAnalogClock();
  showClock();
  getUserInfo();
  fetchLogs();
});
