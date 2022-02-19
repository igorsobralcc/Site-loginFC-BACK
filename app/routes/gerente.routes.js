module.exports = app => {
    const gerente = require("../controllers/gerente.controller.js");
    const authMW = require("../middleware/authMW");
  
    var router = require("express").Router();
  
    router.use(authMW)
  
    // Create a new Tutorial
    router.post("/", gerente.create);
  
    // Retrieve all gerente
    router.get("/", gerente.findAll);
  
    // Retrieve all published gerente
    router.get("/ativo", gerente.findAllAtivo);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", gerente.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", gerente.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", gerente.delete);
  
    // Create a new Tutorial
    router.delete("/", gerente.deleteAll);
  
    app.use("/api/gerente", router);
  };
  