require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", require("./features/users/user.routes"));
app.use("/api/leave", require("./features/leave/leave.routes"));
app.use("/api/logs", require("./features/logs/logs.routes"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.get(/^\/(dashboard|admin)\.html$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", req.path));
});

app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
