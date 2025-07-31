const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";

// Logout
function logout() {
  localStorage.removeItem("token");
  location.href = "/login.html";
}

// Fetch logs
async function fetchLogs() {
  const res = await fetch("/api/logs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const logs = await res.json();
  renderLogs(logs);
}

function renderLogs(logs) {
  const body = document.getElementById("logRows");
  body.innerHTML = "";
  logs.forEach((log) => {
    body.innerHTML += `
      <tr>
        <td>${log.name}</td>
        <td>${log.role || "-"}</td>
        <td>${log.date}</td>
        <td>${log.time_in || "-"}</td>
        <td>${log.time_out || "-"}</td>
        <td>${log.hours?.toFixed(2) || "0.00"}</td>
      </tr>
    `;
  });
}

// Fetch leave requests
async function fetchLeaves() {
  const res = await fetch("/api/leave", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const leaves = await res.json();
  renderLeaves(leaves);
}

function renderLeaves(leaves) {
  const body = document.getElementById("leaveRows");
  const badge = document.getElementById("leaveBadge");
  body.innerHTML = "";
  let pendingCount = 0;

  leaves.forEach((leave) => {
    if (leave.status === "Pending") pendingCount++;
    body.innerHTML += `
      <tr>
        <td>${leave.name}</td>
        <td>${leave.from_date}</td>
        <td>${leave.to_date || "-"}</td>
        <td>${
          leave.reason.length > 15
            ? leave.reason.slice(0, 15) + "..."
            : leave.reason
        }</td>
        <td>${leave.status}</td>
        <td>
          <button onclick="viewLeave(${
            leave.id
          })" class="btn-bubble-yellow">View</button>
          ${
            leave.status === "Pending"
              ? `
            <button onclick="updateLeave(${leave.id}, 'Approved')" class="btn-bubble-blue">Approve</button>
            <button onclick="updateLeave(${leave.id}, 'Rejected')" class="btn-bubble-red">Reject</button>
          `
              : ""
          }
        </td>
      </tr>
    `;
  });

  badge.textContent = pendingCount;
  badge.style.display = pendingCount ? "inline-block" : "none";
}

async function updateLeave(id, status) {
  try {
    const res = await fetch(`/api/leave/${id}/${status.toLowerCase()}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update");
    alert(`Leave ${status}`);
    fetchLeaves();
  } catch (err) {
    console.error(err);
    alert("Failed to update leave.");
  }
}

// View leave detail
function closeLeaveModal() {
  document.getElementById("leaveModal").classList.add("hidden");
}

async function viewLeave(id) {
  try {
    const res = await fetch(`/api/leave/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch leave detail");
    const leave = await res.json();

    document.getElementById("modalName").textContent = leave.name;
    document.getElementById("modalFrom").textContent = leave.from_date;
    document.getElementById("modalTo").textContent = leave.to_date || "-";
    document.getElementById("modalStatus").textContent = leave.status;
    document.getElementById("modalReason").value = leave.reason;

    document.getElementById("leaveModal").classList.remove("hidden");
  } catch (err) {
    console.error("Error viewing leave:", err);
    alert("Could not load leave details.");
  }
}

fetchLogs();
fetchLeaves();
