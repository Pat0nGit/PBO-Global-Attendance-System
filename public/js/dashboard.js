function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

function showClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour12: true });
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = time;
  requestAnimationFrame(showClock);
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
        <td>${log.date}</td>
        <td>${log.time_in || "-"}</td>
        <td>${log.time_out || "-"}</td>
        <td>${log.hours?.toFixed(2) || "0.00"}</td>
      </tr>`
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

// Time In / Time Out
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

showClock();
getUserInfo();
fetchLogs();
