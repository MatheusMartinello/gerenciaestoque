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
function verificaNaBase({idEmpresa, nome}) {
  let produto = await pool.query(
    "SELECT nome FROM produtos WHERE nome = $1 and idestoques = $2",
    [nome.toLowerCase(), parseInt(idEmpresa, 10)]
  )
  if(produto.rows.length === 0) 
    return true; 
  else 
    return false;
}

function geraNota() {
  pool.query("INSERT INTO notafiscal(createat) values($1)",[geraData()])
  const result = pool.quetry("SELECT MAX(idnotafiscal) from notafiscal");
  return result.rows;
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
router.get("/estoque/:id",async(req,res) =>{
  try{
  const result = await pool.query("SELECT produtos.name, produtos.quantidade, produtos.valor FROM produtos WHERE idestoques = $1",
   [req.params.id]);
   res.send(result.rows);}
   catch(err){
     res.status(401).send("Estoque não existe!")
   }
});
//pega produto a partir do id
router.get("/produto:id", async (req, res) => {
  try {
    const result = await pool.quetry(
      `SELECT 'nome' 'qnt' from produtoswhere idprodutos = $1`,
      [req.param.id]
    );
    res.send(result.json());
  } catch (err) {
    console.error("Empresa nao existe!");
  }
});
//cria produto
router.post("/produto", async (req, res) => {
  const { idEmpresa, nome, qtd, codBarras, custo } = req.body;
  let produto = await pool.query(
    "SELECT nome FROM produtos WHERE nome = $1 and idestoques = $2",
    [nome.toLowerCase(), parseInt(idEmpresa, 10)]
  );

  if (verificaNaBase(req.body)) {
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

router.post("/entrada/produto", async (req,res)=>{
  const {idestoques, idproduto, quantidade, idforncedor, idprodutoe } = req.body
  try {
    if(verificaNaBase(req.body)){
      await pool.query("UPDATE produtos SET quantidade = (quantidade + $1) where idproduto = $2 ",
      [quantidade,idproduto]);
      await pool.query("INSERT INTO comprasfornecedor(idestoques,idprodutos,idfornecedor,idprodutoe) values($1,$2,$3,$4)",
      [idestoques, idproduto, idforncedor, idprodutoe ]);
    }
    else{

    }
  } catch (err) {
    res.status(400).send(err);
  }
})
//Gera venda de Produtos
router.post("/venda", async (req, res) => {
  let notafiscalid = '';
  try {
    pool.query("INSERT INTO notafiscal(datavenda) values ($1)", [geraData()]);
    notafiscalid = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
  }
  try {
    const { idestoque, idproduto, qnt, valor } = await req.body;
    pool.query(
      "INSERT INTO venda (idnotafiscal,idprodutos,idestoques,qnt,valor) values ($1,$2,$3,$4,$5)",
      [notafiscalid, idproduto, idestoque, qnt, valor]
    );
    const qntQ = await pool.query("SELECT quantidades FROM produtos WHERE idprodutos = $1",[idproduto]);
    const qntResult = qntQ - qnt;
    pool.query("UPDATE produtos SET quantidade = $1 WHERE idprodutos = $2",[qntResult, idproduto]);
    res.send("Venda adicionada com sucesso!");
  } catch (err) {
    console.error(err);
  }
});
//Ve todas as vendas feitas por todas as lojas
router.get("/venda", async (req,res) => {
    const result = await pool.query("SELECT * from vendas");
    res.send(result.rows);
});
//Verifica Produtos que foram vendidos p/ determinada loja
router.get("/venda/:idnotafiscal/:idestoque",(req,res)=>{
    const notafiscalid = req.params.idnotafiscal;

    const empresaid = req.params.idestoque;
    const result = pool.query("SELECT notafiscal.notafiscalid, produtos.idestoques, produtos.nome"+
                              "from vendas where vendas.idnotafiscal = $1 AND vendas.idestoques = $2"+
                              "inner join produtos on vendas.idestoques = produtos.idestoques",
                              [notafiscalid,
                                empresaid]);
                                res.send(result.rows);
});
module.exports = (controleMain, (app) => app.use("/empresa", router));
