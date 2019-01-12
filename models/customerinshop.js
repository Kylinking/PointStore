'use strict';

module.exports = (sequelize, DataTypes)=>{
    var CustomerInShop = sequelize.define('CustomerInShop',{
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });
    CustomerInShop.associate = function (models) {
        models.CustomerInShop.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopId',
            unique:'custinshop',
            allowNull: false
          }
        });
        models.CustomerInShop.belongsTo(models.CustomerInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'CustomerId',
            allowNull: false,
            unique:'custinshop'
          }
        });
    };
    return CustomerInShop;
};