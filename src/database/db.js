const Pool = require("pg").Pool;

//configurar banco
const pool = new Pool({
    //configuração para o banco
});

module.exports = pool;