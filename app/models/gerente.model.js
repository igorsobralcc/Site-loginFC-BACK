module.exports = (sequelize, Sequelize) => {
    const Gerente = sequelize.define("gerentes", {
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        isEmail: true
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      data_nasc: {
        type: Sequelize.DATEONLY
      },
      nome_mae: {
        type: Sequelize.STRING
      },
      telefone: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
    });
  
    return Gerente;
  };
  