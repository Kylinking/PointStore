module.exports = (sequelize, DataTypes) => {
    var ShopInfo = sequelize.define('ShopInfo', {
        ShopId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        Phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Contact: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });
    ShopInfo.associate = function (models) {
        models.ShopInfo.belongsToMany(models.CustomerInfo, {
            through:'CustomerInShop',
            foreignKey: {
                name: 'CustomerId',
                allowNull: false
            }
        });
        models.ShopInfo.belongsTo(models.ShopInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ParentShopId',
                allowNull: true
            }
        });
        models.ShopInfo.hasOne(models.BounusPointRate,{
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.ShopInfo.hasOne(models.ShopAccountInfo,{
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.ShopInfo.hasOne(models.ShopAccountChange, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.ShopInfo.hasOne(models.TransactionDetail, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.ShopInfo.hasOne(models.CustomerAccountChange, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.ShopInfo.hasOne(models.ShortMessageInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'ShopId',
                allowNull: true
            }
        });
        
    };
    return ShopInfo;
}