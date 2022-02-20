const db = require("../models");
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;
const authConfig = require('../config/auth.json')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const mailer = require('../modules/mailer')

function generateToken(params = {}) {
  return jwt.sign(
    params,
    authConfig.secret, {
      expiresIn: 86400
    }
  )
}

exports.create = async (req, res) => {

  const usuario = {
    login: req.body.login,
    senha: req.body.senha,
    funcao: req.body.funcao ? req.body.funcao : "admin",
    status: req.body.status ? req.body.status : true,
  };

  Usuario.create(usuario)
    .then(data => {
      res.send({
        login: data.login,
        função: data.funcao,
        status: data.status,
        token: generateToken({
          id: data.id
        })
      });
    })
}

exports.autenthicate = async (req, res) => {
  const {
    login,
    senha
  } = req.body
  console.log('login e senha: ', login, senha)
  const usuario = await Usuario.findOne({
    where: {
      login: login
    }
  })

  if (!usuario)
    return res.status(400).send({
      error: 'Usuário não existe'
    })

  if (!await bcrypt.compare(senha, usuario.senha_hash))
    return res.status(400).send({
      error: 'Senha inválido'
    })

  usuario.senha = undefined


  return res.send({
    id: usuario.id,
    login: usuario.login,
    função: usuario.funcao,
    status: usuario.status,
    token: generateToken({
      id: usuario.id
    })
  })
}

exports.forgot = async (req, res) => {
  const {
    login
  } = req.body

  try {
    var loginFind = await Usuario.findOne({
      where: {
        login: login
      }
    })

    if (!loginFind)
      return res.status(400).send({
        error: 'usuario não existe'
      })

    const token = crypto.randomBytes(20).toString('hex')

    const now = new Date()

    now.setHours(now.getHours() + 1)

    await Usuario.update({
      passwordResetToken: token,
      passwordResetExpires: now
    }, {
      where: {
        id: loginFind.dataValues.id
      }
    })

    mailer.sendMail({
      to: login,
      from: 'igorsobral.cc@gmail.com',
      template: 'auth/forgot_password',
      context: {
        token
      }
    }, (err) => {
      if (err)
        return res.status(400).send({
          error: 'não foi possivel recuperar a senha'
        })
      return res.send({
        ok: 'Email enviado'
      })
    })

  } catch (error) {
    return res.status(400).send({
      error: 'Erro ao recuperar a senha, tente novamente'
    })
  }
}

exports.recover = async (req, res) => {
  const {
    senha,
    token
  } = req.body

  try {
    var loginFind = await Usuario.findOne({
      where: {
        passwordResetToken: token
      }
    })

    if (token !== loginFind.dataValues.passwordResetToken)
      return res.status(400).send({
        error: 'Token invalido'
      })

    const now = new Date()

    if (now > loginFind.dataValues.passwordResetExpires)
      return res.status(400).send({
        error: 'Token expirou, gere um novo'
      })

    await Usuario.update({
      senha: senha,
      passwordResetExpires: now
    }, {
      where: {
        id: loginFind.dataValues.id
      }
    })

    res.send({
      ok: 'recuperado',
      token: generateToken({
        id: loginFind.dataValues.id
      })
    })

  } catch (error) {
    console.log("erro ", error)
    res.status(400).send({
      error: 'não foi posivel resetar a senha, tente novamente'
    })
  }
}

// Retrieve all Usuarios from the database.
exports.findAll = (req, res) => {
  const nome = req.query.nome;
  var condition = nome ? {
    nome: {
      [Op.iLike]: `%${nome}%`
    }
  } : null;

  Usuario.findAll({
      where: condition
    })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Aconteceu um erro ao consultar os usuarios."
      });
    });
};

// Find a single Usuario with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Erro ao pegar o usuario com id=" + id
      });
    });
};

// Update a Usuario by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Usuario.update(req.body, {
      where: {
        id: id
      }
    })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Usuario foi atualizado com sucesso."
        });
      } else {
        res.send({
          message: `Nao pode atualizar usuario com id=${id}. talvez usuario nao foi encontrado ou o req.body está.vazio!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "erro ao atualizar usuario com id=" + id
      });
    });
};

// Delete a Usuario with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Usuario.update({
      status: false
    }, {
      where: {
        id: id
      }
    })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Usuario foi deletado com sucesso!"
        });
      } else {
        res.send({
          message: `Nao pode atualizar usuario com id=${id}. Talvez usuario nao foi encontrado!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Nao pode deletar usuario com id=" + id
      });
    });
};

// Delete all Usuarios from the database.
exports.deleteAll = (req, res) => {
  Usuario.update({
      status: false
    }, {
      where: {},
      truncate: false
    })
    .then(nums => {
      res.send({
        message: `${nums} Usuarios foram deletados com sucesso!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Aconteceu um erro ao deletar todos os usuarios."
      });
    });
};

// find all status Usuario
exports.findAllAtivo = (req, res) => {
  Usuario.findAll({
      where: {
        status: true
      }
    })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Aconteceu um erro ao pegar todos os usuarios."
      });
    });
}