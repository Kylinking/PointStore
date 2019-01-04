'use strict';

module.exports = (sequelize, DataTypes) => {
    var CustomerInfo = sequelize.define('CustomerInfo', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Name: {
            type: DataTypes.STRING.BINARY,
            unique: "name_phone",
            allowNull: true,
        },
        Phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "name_phone",
        },
        Address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Age: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        Sex: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });

    CustomerInfo.associate = function (models) {
        models.CustomerInfo.belongsToMany(models.ShopInfo, {
            through: 'CustomerInShop',
            foreignKey: {
                name: 'CustomerId',
                allowNull: false
            }
        });
        models.CustomerInfo.belongsTo(models.CustomerInfo, {
            onDelete: "CASCADE",
            as: "RecommendCustomerInfo",
            foreignKey: {
                name: 'RecommendCustomerId',
                allowNull: true
            }
        });
        models.CustomerInfo.hasOne(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'CustomerId',
                allowNull: true
            }
        });
    };
    return CustomerInfo;
}