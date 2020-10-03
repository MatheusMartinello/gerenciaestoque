-- Postgresql
CREATE TABLE "estoques"
(
    "idestoques" int NOT NULL,
    "nome" varchar(50) NOT NULL,
    "endereco" varchar(50) NOT NULL,
    "telefone" int NOT NULL,
    "tipo" varchar(50) NOT NULL,
    CONSTRAINT "PK_local" PRIMARY KEY ( "idestoques" )
);
CREATE TABLE "produtos"
(
    "idprodutos" int NOT NULL
    GENERATED ALWAYS AS IDENTITY
    (
 start 0
 ),
 "idestoques"   int NOT NULL,
 "nome"         varchar
    (50) NOT NULL,
 "quantidade"   int NOT NULL,
 "codigobarras" int NOT NULL,
 "createat"     date NOT NULL,
 "custo"        numeric NOT NULL,
 "mediadevalor" numeric NOT NULL,
 "medida"       varchar
    (50) NOT NULL,
 CONSTRAINT "PK_produtos" PRIMARY KEY
    ( "idprodutos", "idestoques" ),
 CONSTRAINT "FK_14" FOREIGN KEY
    ( "idestoques" ) REFERENCES "estoques"
    ( "idestoques" )
);


    CREATE TABLE "fornecedor"
    (
        "idfornecedor" serial NOT NULL,
        "Nome" varchar(50) NOT NULL,
        "telefone" varchar(50) NOT NULL,
        "endereco" varchar(50) NOT NULL,
        CONSTRAINT "PK_fornecedor" PRIMARY KEY ( "idfornecedor" )
    );

    CREATE TABLE "insumos"
    (
        "idprodutos" int NOT NULL,
        "idestoques" int NOT NULL,
        "idpedido" integer NOT NULL,
        CONSTRAINT "PK_insumos" PRIMARY KEY ( "idprodutos", "idestoques", "idpedido" ),
        CONSTRAINT "FK_42" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),
        CONSTRAINT "FK_46" FOREIGN KEY ( "idpedido" ) REFERENCES "pedidoFabricacao" ( "idpedido" )
    );

    CREATE TABLE "notafiscal"
    (
        "idnotafiscal" serial NOT NULL,
        "nome" NOT NULL,
        CONSTRAINT "PK_notafiscal" PRIMARY KEY ( "idnotafiscal" )
    );

    CREATE TABLE "consumointerno"
    (
        "idconsumo" serial NOT NULL,
        "idprodutos" int NOT NULL,
        "idestoques" int NOT NULL,
        "createat" date NOT NULL,
        CONSTRAINT "PK_consumointerno" PRIMARY KEY ( "idconsumo", "idprodutos", "idestoques" ),
        CONSTRAINT "FK_53" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" )
    );


    CREATE TABLE "produtosFornecedor"
    (
        "idProdutosE" serial NOT NULL,
        "idfornecedor" integer NOT NULL,
        "nome" varchar(50) NOT NULL,
        "qnt" integer NOT NULL,
        "custo" numeric NOT NULL,
        CONSTRAINT "PK_produtosfornecedor" PRIMARY KEY ( "idProdutosE", "idfornecedor" ),
        CONSTRAINT "FK_68" FOREIGN KEY ( "idfornecedor" ) REFERENCES "fornecedor" ( "idfornecedor" )
    );


    CREATE TABLE "devolucao"
    (
        "idprodutos" int NOT NULL,
        "idestoques" int NOT NULL,
        "idProdutosE" integer NOT NULL,
        "idfornecedor" integer NOT NULL,
        "idnotafiscal" integer NOT NULL,
        CONSTRAINT "PK_devolucao" PRIMARY KEY ( "idprodutos", "idestoques", "idProdutosE", "idfornecedor", "idnotafiscal" ),
        CONSTRAINT "FK_101" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" ),
        CONSTRAINT "FK_87" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),
        CONSTRAINT "FK_92" FOREIGN KEY ( "idProdutosE", "idfornecedor" ) REFERENCES "produtosFornecedor" ( "idProdutosE", "idfornecedor" )
    );


    CREATE TABLE "comprasFornecedor"
    (
        "idProdutosE" integer NOT NULL,
        "idfornecedor" integer NOT NULL,
        "idprodutos" int NOT NULL,
        "idestoques" int NOT NULL,
        "idnotafiscal" integer NOT NULL,
        CONSTRAINT "PK_comprasfornecedor" PRIMARY KEY ( "idProdutosE", "idfornecedor", "idprodutos", "idestoques", "idnotafiscal" ),
        CONSTRAINT "FK_104" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" ),
        CONSTRAINT "FK_72" FOREIGN KEY ( "idProdutosE", "idfornecedor" ) REFERENCES "produtosFornecedor" ( "idProdutosE", "idfornecedor" ),
        CONSTRAINT "FK_82" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" )
    );
    CREATE TABLE "pedidoFabricacao"
    (
        "idpedido" serial NOT NULL,
        "createat" date NOT NULL,
        CONSTRAINT "PK_pedidofabricacao" PRIMARY KEY ( "idpedido" )
    );
    CREATE TABLE "venda"
    (
        "idprodutos" int NOT NULL,
        "idestoques" int NOT NULL,
        "idnotafiscal" integer NOT NULL,
        CONSTRAINT "PK_table_21" PRIMARY KEY ( "idprodutos", "idestoques", "idnotafiscal" ),
        CONSTRAINT "FK_22" FOREIGN KEY ( "idprodutos", "idestoques" ) REFERENCES "produtos" ( "idprodutos", "idestoques" ),
        CONSTRAINT "FK_31" FOREIGN KEY ( "idnotafiscal" ) REFERENCES "notafiscal" ( "idnotafiscal" )
    );