module.exports = (sequelize, Sequelize) => {
    const Gerente = sequelize.define("gerentes", {
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      matricula: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      area: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contato: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
    });
  
    return Gerente;
  };
  