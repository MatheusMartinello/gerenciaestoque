const express = require("express");
const router = express.Router();
const pool = require('./database/db');

//PRECISA TESTAR

router.post('/empresa',async(req, res)=>{
    const { nome, endereco, telefone} = req.body;
    let empresa = await pool.query("SELECT * FROM estoques WHERE nome = $1",[nome]);
    try {
        if(!empresa){
            res.send("Empresa ja cadastrada!");
        }
        else{
            pool.query("INSERT INTO estoques (nome, enderenco,telefone) VALUES($1,$2,$3)",
                [nome],
                [endereco],
                [telefone]
            )
        }
    } catch (err) {
        res.send(err);
    }
});

router.get("/empresa", async(req, res)=>{
    const empresasBD = () =>{
        return await pool.query("SELECT * FROM estoques"); 
    }
    res.send(empresasBD.json());
});

router.get("/empresa/produto/:id",async (req,res)=>{
    try {
        const result = await pool.quetry("SELECT 'nome' 'qnt'"
                                    +" from produtos" +
                                    "where = $1",
                                    [req.route.query.id]);
        res.send(result.json());
    } catch (err) {
        console.error("Empresa nao existe!")
    }
       
})

router.post('/produto', async (req, res)=>{
    const { idEmpresa,nome,qtd,codBarras,custo } = req.body;
    let produto = await pool.query("SELECT * FROM produto WHERE nome = $1 RETURN ", [nome.toLowerCase()])
    try {
        if(!produto)  {
            produto.qtd += qtd;
            await pool.query("UPDATE produto SET qnt = $1, dataAtualizacao = $2 where idPRODUTO = $3" , 
                [produto.qtd]
                [Date()]
                [produto.idPRODUTO]
            );
            res.send("Produto Atualizado! ");
        }
        else {
            await pool.query("INSERT INTO produto (idEmpresa,nome,qtd,codBarras,custo) VALUES ($1,$2,$3,$4)",
            [idEmpresa]
            [nome.toUpperCase()]
            [qtd]
            [codBarras]
            [custo]
            );
            res.send("Produto criado!");
        };   
    } catch (error) {
        console.error(error.message);
    }
});

router.post("/gera/notafiscal/",(req,res)=>{
    try{ 
        await pool.query("INSERT INTO notafiscal values ($1)",[Date()]);
        result = await pool.query("SELECT MAX(idnotafiscal) from notafiscal");
        res.send("id da nota fiscal ==>", result.json());
    }catch(err){
        console.err(err);
    }
});

router.post("/gera/venda",(req,res)=>{
    try {
        const { idestoque, idproduto, idnotafiscal, qnt, valor} = req.body;
        await pool.query("INSERT INTO venda ('idnotaficasl','idproduto','idestoque','qnt','valor') values ($1,$2,$3,$4,$5)",
            [idnotafiscal],
            [idproduto],
            [idestoque],
            [qnt],
            [valor]
        )
        res.send("Venda adicionada com sucesso!");
    } catch (err) {
        console.err(err)
    }
})