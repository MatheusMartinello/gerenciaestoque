const express = require("express");
const router = express.Router();
const pool = require('./database/db');

//PRECISA TESTAR
router.post('/produto', async (req, res)=>{
    const { idEmpresa,nome,qtd,codBarras,custo } = req.body;
    let produto = await pool.query("SELECT * FROM produto WHERE nome = $1 RETURN ", [nome.toUpperCase()])
    try {
        if(!produto)  {
            produto.qtd += qtd;
            await pool.query("UPDATE produto SET qnt = $1, dataAtualizacao = $2 where idPRODUTO = $3" , 
                [produto.qtd]
                [Date.now()]
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
    
})