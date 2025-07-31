document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const employee_id = document.getElementById("employee_id").value.trim();
  const pin = document.getElementById("pin").value.trim();

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id, pin }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);

    // Ensure user object is returned in login
    const role = data.user?.role?.toLowerCase();
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } else {
    alert(data.message || "Login failed.");
  }
});
