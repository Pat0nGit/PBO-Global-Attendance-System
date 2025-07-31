function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

const token = localStorage.getItem("token");
if (!token) logout();

function getUserInfo() {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

const user = getUserInfo();
if (!user) logout();
else {
  document.getElementById("username").textContent = user.name || "Admin";

  if (user.role === "admin") {
    const backBtn = document.createElement("button");
    backBtn.textContent = "← Admin Dashboard";
    backBtn.className = "btn-blue";
    backBtn.onclick = () => (window.location.href = "admin.html");
    document.getElementById("backBtnContainer").appendChild(backBtn);
  }
}

function fetchUsers() {
  fetch("/api/users", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(renderUsers)
    .catch(() => alert("Failed to load users."));
}

function renderUsers(users) {
  const rows = users
    .map(
      (u) => `
    <tr>
      <td>${u.name}</td>
      <td>${u.employee_id}</td>
      <td>${u.role}</td>
      <td>${u.email || "-"}</td>
      <td>
        <button onclick="showEditModal(${u.id}, '${u.name}', '${
        u.employee_id
      }', '${u.email || ""}', '${u.role}')" class="btn-yellow">Edit</button>
        <button onclick="deleteUser(${u.id})" class="btn-logout">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");

  document.getElementById("userRows").innerHTML = rows;
}

document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById("name").value,
    employee_id: document.getElementById("employee_id").value,
    pin: document.getElementById("pin").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value,
  };

  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert("User added.");
    fetchUsers();
    e.target.reset();
  } else {
    const data = await res.json();
    alert(data.message || "Failed to add user.");
  }
});

function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error();
      alert("User deleted.");
      fetchUsers();
    })
    .catch(() => alert("Failed to delete user."));
}

function showEditModal(id, name, employee_id, email, role) {
  document.getElementById("edit_id").value = id;
  document.getElementById("edit_name").value = name;
  document.getElementById("edit_employee_id").value = employee_id;
  document.getElementById("edit_email").value = email;
  document.getElementById("edit_role").value = role;
  document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

document
  .getElementById("editUserForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("edit_id").value;

    const body = {
      name: document.getElementById("edit_name").value,
      employee_id: document.getElementById("edit_employee_id").value,
      email: document.getElementById("edit_email").value,
      role: document.getElementById("edit_role").value,
    };

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("User updated.");
      fetchUsers();
      closeEditModal();
    } else {
      const data = await res.json();
      alert(data.error || "Update failed.");
    }
  });

fetchUsers();
