const express = require("express");
const router = express.Router();
const pool = require("../database/db");

function geraData() {
  const d = new Date();
  return d.toLocaleString();
}
//PRECISA TESTAR
function controleMain() {
  return (req, res, next) => {
    next();
  };
}
//cria empresa
router.post("/", async (req, res) => {
  const { nome, endereco, telefone } = req.body;
  const empresa = await pool.query(
    "SELECT name FROM estoques WHERE name = $1",
    [nome]
  );
  if (empresa.rows.length == 0) {
    const newEmpresa = await pool.query(
      "INSERT INTO estoques (name, endereco,telefone) VALUES($1,$2,$3)",
      [nome, endereco, telefone]
    );
    res.json(newEmpresa);
  } else {
    res.status(400).send({ error: "Ja tem essa empresa cadastrada!" });
  }
});
//ve toda base de empresas
router.get("/", async (req, res) => {
  const empresasBD = await pool.query("SELECT * FROM estoques");
  res.send(empresasBD);
});

router.get("/empresa/produto/:id", async (req, res) => {
  try {
    const result = await pool.quetry(
      "SELECT 'nome' 'qnt'" + " from produtos" + "where = $1",
      [req.route.query.id]
    );
    res.send(result.json());
  } catch (err) {
    console.error("Empresa nao existe!");
  }
});

router.post("/produto", async (req, res) => {
  const { idEmpresa, nome, qtd, codBarras, custo } = req.body;
  let produto = await pool.query(
    "SELECT nome FROM produtos WHERE nome = $1 and idestoques = $2",
    [nome.toLowerCase(), parseInt(idEmpresa, 10)]
  );

  if (produto.rows.length != 0) {
    parseInt(produto.qtd, 10) += parseInt(qtd, 10);
    pool.query(
      "UPDATE produtos SET quantidade = $1, createat = $2 where idPRODUTO = $3",
      [produto.qtd, Date(), produto.idPRODUTO]
    );
    res.send("Produto Atualizado! ");
  } else {
    pool.query(
      "INSERT INTO produtos (idestoques,nome,quantidade,codigobarras,custo,createat) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        parseInt(idEmpresa, 10),
        nome.toUpperCase(),
        parseInt(qtd, 10),
        parseInt(codBarras, 10),
        custo,
        geraData(),
      ]
    );
    res.send("Produto criado!");
  }
});

router.post("/notafiscal", async (req, res) => {
  try {
    pool.query("INSERT INTO notafiscal(datavenda) values ($1)", [geraData()]);
    result = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
  }
});

router.post("/venda", (req, res) => {
  try {
    const { idestoque, idproduto, idnotafiscal, qnt, valor } = req.body;
    pool.query(
      "INSERT INTO venda (idnotafiscal,idprodutos,idestoques,qnt,valor) values ($1,$2,$3,$4,$5)",
      [idnotafiscal, idproduto, idestoque, qnt, valor]
    );
    res.send("Venda adicionada com sucesso!");
  } catch (err) {
    console.error(err);
  }
});

module.exports = (controleMain, (app) => app.use("/empresa", router));
