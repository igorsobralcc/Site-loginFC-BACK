const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuarios", {
        gerente_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'gerentes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        passwordResetToken: {
            type: Sequelize.STRING
        },
        passwordResetExpires: {
            type: Sequelize.DATE
        },
        login: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        senha: {
            type: Sequelize.VIRTUAL,
            allowNull: false,
        },
        funcao: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['gerente', 'admin']],
                    msg: 'O usuário deve ser um gerente'
                }
            }
        },
        senha_hash: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
    });

    Usuario.addHook('beforeSave', async usuario => {
        if (usuario.senha) {
            usuario.senha_hash = await bcrypt.hash(usuario.senha, 8)
        }
    })

    Usuario.associate = models => {
        Usuario.hasMany(models.gerentes, {
            foreignKey: 'id',
            sourceKey: 'gerente_id',
            as: 'gerente'
        })
    }
    

    return Usuario;
};
