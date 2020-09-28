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
// Verifica Produto base de dados
async function verificaNaBase({ idEmpresa, nome, idprodutos }) {
  console.log(nome);
  console.log(idEmpresa);
  try {
    const produto = await pool.query(
      "SELECT * FROM produtos WHERE nome like $1 and idestoques = $2",
      [nome.toUpperCase(), parseInt(idEmpresa, 10)]
    );
    if (produto.rows.length === 0) return produto;
    else return produto;
  } catch (error) {
    console.error(error);
  }
}
async function geraNota(tipo) {
  pool.query("INSERT INTO notafiscal(datavenda,tipo) values($1,$2)", [
    geraData(),
    tipo,
  ]);
  const result = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
  return result.rows[0].max;
}
async function pegaValoresProdutoF({ idfornecedor, idprodutof }) {
  const result = await pool.query(
    'select * from "produtosFornecedor" pf where "idProdutosE" = $1 and idfornecedor = $2',
    [idfornecedor, idprodutof]
  );
  return result;
}
async function criaProduto(objeto, idestoques) {
  const validaProduto = await pool.query(
    "SELECT * from produtos where nome like $1 and idestoques = $2",
    [objeto.nome.toUpperCase(), idestoques]
  );
  
  if (validaProduto.rows.length === 0) {
    const valorMedio = custo;
    const result = await pool.query(
      "INSERT INTO produtos(nome,quantidade,custo,idestoques,valormedio) VALUES ($1,$2,$3,$4,$5)",
      [objeto.nome.toUpperCase(), objeto.qnt, objeto.custo, idestoques,valorMedio]
    );
    console.log(result.rows);
  } else {
    const valormedio = (parseFloat(objeto.qnt)*parseFloat(objeto.custo))+(parseFloat(validaProduto.rows[0].quantidade)*parseFloat(validaProduto.rows[0].custo))/(parseFloat(validaProduto.rows[0].quantidade)+parseFloat(objeto.qnt));
    objeto.qnt =
      parseInt(validaProduto.rows[0].quantidade) + parseInt(objeto.qnt);
    const result = await pool.query(
      "update produtos set quantidade = $1, custo = $2, createat = $3, valormedio = $6 where idproduto = $4 and idestoques =$5",
      [objeto.qnt, objeto.custo, geraData(),validaProduto.rows[0].idproduto,validaProduto.rows[0].idestoques, valormedio]
    );
  }
}
async function getIdProduto(objeto, idestoques) {
  const validaProduto = await pool.query(
    "SELECT idprodutos from produtos where nome like $1 and idestoques = $2",
    [objeto.nome.toUpperCase(), idestoques]
  );
 return validaProduto.rows[0].idprodutos;
}
async function geraComprasF(objeto, req, idnotafiscal) {
  const { idestoques, idfornecedor, idprodutof, qnt, custo } = req.body;
  const {quantidadedb,custodb} = await pool.query("SELECT quantidade, custo from produtos where ")
  await pool.query(
    'insert into "comprasFornecedor"("idProdutosE",idfornecedor,idprodutos,idestoques,idnotafiscal,quantidade,custo)values($1,$2,$3,$4,$5,$6,$7)',
    [
      idprodutof,
      idfornecedor,
      await getIdProduto(objeto, idestoques),
      idestoques,
      idnotafiscal,
      qnt,
      custo,
    ]
  );
  return true;
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
//ve toda os estoques empresas
router.get("/", async (req, res) => {
  const empresasBD = await pool.query("SELECT * FROM estoques");
  res.send(empresasBD);
});
//verifica todos os produtos disponiveis para certa empreas
router.get("/estoque/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const result = await pool.query(
      "SELECT nome, quantidade, custo FROM produtos WHERE idestoques = $1",
      [req.params.id]
    );
    res.send(result.rows);
  } catch (err) {
    res.status(401).send(err);
  }
});
//pega produto a partir do id
router.get("/produto:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 'nome' 'qnt' from produtoswhere idprodutos = $1`,
      [req.param.id]
    );
    res.send(result.json());
  } catch (err) {
    console.error(err);
  }
});
//cria produto
router.post("/produto", async (req, res) => {
  const { idEmpresa, nome, qtd, codBarras, custo } = req.body;
  let produto = await verificaNaBase(req.body);
  console.log(produto.rows[0].quantidade);
  try {
    if (produto.rows.length !== 0) {
      const test = parseInt(produto.rows[0].quantidade) + parseInt(qtd);
      console.log(test);
      produto.rows[0].quantidade = test;
      console.log(produto.rows[0].idprodutos);
      await pool.query(
        "UPDATE produtos SET quantidade = $1, createat = $2, custo = $3 where idprodutos = $4 and idestoques = $5",
        [
          produto.rows[0].quantidade,
          geraData(),
          custo,
          produto.rows[0].idprodutos,
          idEmpresa,
        ]
      );
      res.send("Produto Atualizado!");
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
  } catch (error) {
    console.error(error);
  }
});
//Gera venda de Produtos
router.post("/venda", async (req, res) => {
  const idnotafiscal = await geraNota("Venda");
  console.log(idnotafiscal);
  try {
    const { idestoque, idproduto, qnt, valor } = await req.body;
    pool.query(
      "INSERT INTO venda (idnotafiscal,idprodutos,idestoques,qnt,valor) values ($1,$2,$3,$4,$5)",
      [idnotafiscal, idproduto, idestoque, qnt, valor]
    );
    const qntQ = await pool.query(
      "SELECT quantidade FROM produtos WHERE idprodutos = $1",
      [idproduto]
    );
    console.log(qntQ);
    let qntResult = qntQ.rows[0].quantidade - qnt;
    if (qntResult < 0)
      res.status(402).send("Nao tem quantdade suficiente para a venda");
    else
      pool.query(
        "UPDATE produtos SET quantidade = $1 WHERE idprodutos = $2 and idestoques = $3",
        [qntResult, idproduto, idestoque]
      );
    res.send("Venda adicionada com sucesso!");
  } catch (err) {
    console.error(err);
  }
});
//Ve todas as vendas
router.get("/venda", async (req, res) => {
  const result = await pool.query("SELECT * from vendas");
  res.send(result.rows);
});
//Quais produtos que foram vendidos de determinada loja e para qual nota fiscal
router.get("/venda/:idnotafiscal/:idestoque", (req, res) => {
  const notafiscalid = req.params.idnotafiscal;
  const empresaid = req.params.idestoque;
  const result = pool.query(
    "SELECT notafiscal.notafiscalid, produtos.idestoques, produtos.nome" +
      "from vendas where vendas.idnotafiscal = $1 AND vendas.idestoques = $2" +
      "inner join produtos on vendas.idestoques = produtos.idestoques",
    [notafiscalid, empresaid]
  );
  res.send(result.rows);
});
//registar consumo interno
router.post("/consumo/interno", async (req, res) => {
  const { idprodutos, idestoques, quantidade } = req.body;
  const result = await pool.query(
    "SELECT * FROM produtos where idprodutos = $1 and idestoques = $2",
    [idprodutos, idestoques]
  );
  console.log(result.rows[0]);
  if (result.rows !== 0) {
    const aux_quantidade = parseInt(result.rows[0].quantidade) - quantidade;
    await pool.query(
      "insert into consumointerno(idprodutos,idestoques,createat,quantidade) values ($1,$2,$3,$4)",
      [idprodutos, idestoques, geraData(), quantidade]
    );
    await pool.query(
      "update produtos set quantidade = $1 where idprodutos = $2 and idestoques = $3",
      [aux_quantidade, idprodutos, idestoques]
    );
  }
});
//registro de devolucao
router.post("/devolucao/produto", async (req, res) => {
  const aux = await geraNota("Devolucao");
  const {
    idestoques,
    idprodutos,
    idfornecedor,
    idprodutof,
    quantidade,
  } = req.body;
  await pool.query(
    'INSERT INTO devolucao(idestoques, idprodutos, idfornecedor, "idProdutosE",idnotafiscal, quantidade)values($1,$2,$3,$4,$5,$6)',
    [idestoques, idprodutos, idfornecedor, idprodutof, aux, quantidade]
  );
  res.send("Sucesso! ");
});
//registrar entrada de produto
router.post("/entrada/produto", async (req, res) => {
  const aux = await geraNota("teste");
  const { idestoques } = req.body;
  const result = await pegaValoresProdutoF(req.body);
  await criaProduto(result.rows[0], idestoques);
  geraComprasF(result.rows[0], req, aux);

  res.send("rodo");
});
//pedido de fabrica
router.post("/fabricacao", async (req, res) => {
  const { idprodutos, idestoques, quantidade } = req.body;
  try {
    await pool.query('INSERT INTO "pedidoFabricacao"(createat)values($1)', [
      geraData(),
    ]);
    const result = await pool.query(
      'SELECT MAX(idpedido) FROM "pedidoFabricacao"'
    );
    console.log(result.rows[0].max);
    await pool.query(
      "insert into insumos(idprodutos,idestoques,idpedido,quantidade)values($1,$2,$3,$4)",
      [idprodutos, idestoques, result.rows[0].max, quantidade]
    );
    res.send("Pedido de fabrica gerado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(404).send(err);
  }
});

module.exports = (controleMain, (app) => app.use("/empresa", router));
