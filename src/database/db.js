const Pool = require("pg").Pool;

//configurar banco
const pool = new Pool({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: "5432",
  database: "postgres",
});

module.exports = pool;
