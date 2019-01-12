module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        Role: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        Password: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });
    User.associate = function (models) {
        User.hasOne(models.ShopInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'UserId',
                allowNull: false,
                unique:true
            }
        });
        User.hasOne(models.CustomerInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'UserId',
                allowNull: false,
                unique:true
            }
        });
    }
    return User;
}