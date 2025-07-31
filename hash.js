const bcrypt = require("bcryptjs");

const pin = "1234";
const hashed = bcrypt.hashSync(pin, 10);

console.log(`Hashed PIN for "${pin}":\n`, hashed);
