const db = require("../models");
const Gerente = db.gerentes;
const Op = db.Sequelize.Op;
const Usuario = db.usuarios;
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

function generateToken(params = {}) {
  return jwt.sign(
    params,
    authConfig.secret,
    {
      expiresIn: 86400
    }
  )
}

// Create and Save a new Gerente
exports.create = async (req, res) => {

  var userId = req.userId
  var funcaoFind = await Usuario.findOne({
    where: {
      id: userId
    }
  })

  const gerente = {
    nome: req.body.nome,
    email: req.body.email,
    cpf: req.body.cpf,
    telefone: req.body.telefone,
    data_nasc: req.body.data_nasc,
    nome_mae: req.body.nome_mae,
    status: req.body.status ? req.body.status : true,
  };

  // Create a Usuario
  const usuario = {
    gerente_id: req.body.gerente_id,
    login: req.body.login,
    senha: req.body.senha,
    funcao: req.body.funcao ? req.body.funcao : "gerente",
    status: req.body.status ? req.body.status : true,
  };

  var gerenteFind = await Gerente.findOne({
    where: {
      cpf: gerente.cpf
    }
  })
  var emailFind = await Gerente.findOne({
    where: {
      email: gerente.email
    }
  })

  if (gerenteFind != null) {
    if (gerenteFind.dataValues.cpf == gerente.cpf)
      return res.status(400).send({ error: 'Matricula ja existe' })
  }
  if (emailFind != null) {
    if (emailFind.dataValues.email == gerente.email)
      return res.status(400).send({ error: 'Email ja existe' })
  }

  await Gerente.create(gerente)
    .then(data => {
      usuario.gerente_id = data.id
      Usuario.create(usuario)
        .then(data => {
          res.send({ nome: gerente.nome, cpf: gerente.cpf, login: data.login, data_nasc: gerente.data_nasc, nome_mae: gerente.nome_mae, telefone: gerente.telefone, email: gerente.email, função: data.funcao, status: data.status, token: generateToken({ id: data.id }) });
        })
    })
    .catch(error => {
      res.status(400).send({
        error: "Ocorreu um erro ao criar o Gerente."
      });
    },
    )

}

// Retrieve all Gerentes from the database.
exports.findAll = (req, res) => {
  const nome = req.query.nome;
  var condition = nome ? { nome: { [Op.iLike]: `%${nome}%` } } : null;

  Gerente.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Aconteceu um erro ao consultar os gerentes."
      });
    });
};

// Find a single Gerente with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Gerente.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Erro ao pegar o gerente com id=" + id
      });
    });
};

// Update a Gerente by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  var userId = req.userId
  var funcaoFind = await Usuario.findOne({
    where: {
      id: userId
    }
  })
  var gerenteFind = await Gerente.findOne({
    where: {
      cpf: req.body.cpf
    }
  })
  var emailFind = await Gerente.findOne({
    where: {
      email: req.body.email
    }
  })

  if (emailFind != null) {
    if (emailFind.dataValues.email == req.body.email)
      return res.status(400).send({ error: 'Email ja existe' })
  }
  if (funcaoFind != null) {
    if (!(funcaoFind.dataValues.funcao == "admin"))
      return res.status(400).send({ error: 'Voce não tem permissão para alterar esse usuario' })
  }

  Gerente.update(req.body, {
    where: { id: id }
  })
    .then(async num => {
      var idFind = await Gerente.findOne({
        where: {
          id: id
        }
      })
      if (idFind.dataValues.status == false) {
        await Usuario.update({ status: false }, {
          where: {
            gerente_id: id
          }
        })
      } else {
        await Usuario.update({ status: true }, {
          where: {
            gerente_id: id
          }
        })
      }
      if (num == 1) {
        res.send({
          message: "Gerente foi atualizado com sucesso."
        });
      } else {
        res.send({
          message: `Nao pode atualizar gerente com id=${id}. talvez gerente nao foi encontrado ou o req.body está.vazio!`
        });
      }
    })
    .catch(error => {
      res.status(400).send({
        error: "erro ao atualizar gerente com id=" + id
      });
    });
};

// Delete a Gerente with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  var userId = req.userId
  var funcaoFind = await Usuario.findOne({
    where: {
      id: userId
    }
  })
  if (funcaoFind != null) {
    if (!(funcaoFind.dataValues.funcao == "gerente" || funcaoFind.dataValues.funcao == "admin"))
      return res.status(400).send({ error: 'Voce não tem permissão para alterar esse usuario' })
  }

  Gerente.update({ status: false }, {
    where: { id: id }
  })
    .then(async (num) => {
      var idFind = await Usuario.findOne({
        where: {
          gerente_id: userId
        }
      })
      if (idFind.dataValues.status == true) {
        await Usuario.update({ status: false }, {
          where: {
            gerente_id: userId
          }
        })
      }
      if (num == 1) {
        res.send({
          message: "Gerente foi deletado com sucesso!"
        });
      } else {
        res.send({
          message: `Nao pode atualizar gerente com id=${id}. Talvez gerente nao foi encontrado!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Nao pode deletar gerente com id=" + id
      });
    });
};

// Delete all Gerentes from the database.
exports.deleteAll = async (req, res) => {

  var userId = req.userId
  var funcaoFind = await Usuario.findOne({
    where: {
      id: userId
    }
  })
  if (funcaoFind != null) {
    if (!(funcaoFind.dataValues.funcao == "gerente" || funcaoFind.dataValues.funcao == "admin"))
      return res.status(400).send({ error: 'Voce não tem permissão para alterar esse usuario' })
  }

  Gerente.update({ status: false }, {
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Gerentes foram deletados com sucesso!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Aconteceu um erro ao deletar todos os gerentes."
      });
    });
};

// find all status Gerente
exports.findAllAtivo = (req, res) => {
  Gerente.findAll({ where: { status: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Aconteceu um erro ao pegar todos os gerentes."
      });
    });
};
