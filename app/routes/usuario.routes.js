module.exports = app => {
    const usuario = require("../controllers/usuario.controller.js");
    const authMW = require("../middleware/authMW");

    var router = require("express").Router();

    router.post("/autenticar", usuario.autenthicate);

    router.post("/", usuario.create);

    router.post("/recuperar_senha", usuario.forgot);

    router.put("/recuperar_senha", usuario.recover);

    router.use(authMW)

    // Retrieve all usuario
    router.get("/", usuario.findAll);

    // Retrieve all published usuario
    router.get("/ativo", usuario.findAllAtivo);

    // Retrieve a single Tutorial with id
    router.get("/:id", usuario.findOne);

    router.put("/:id", usuario.update);

    // Delete a Tutorial with id
    router.delete("/:id", usuario.delete);

    // Create a new Tutorial
    router.delete("/", usuario.deleteAll);

    app.use("/api/usuario", router);
  };
