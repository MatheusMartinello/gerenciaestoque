const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./controller/controleMain")(app);

app.listen(3001, () => {
  console.log("Server up on port 3001!");
});
