'use strict';

module.exports = (sequelize, DataTypes)=>{
    var CustomerInfo = sequelize.define('CustomerInfo',{
        CustomerId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true,
        },
        Name:{
            type:DataTypes.STRING.BINARY,
            allowNull:true,
        },
        Phone:{
            type:DataTypes.STRING,
            allowNull:false,
            unique: true,
        },
        Address:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        Status:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        Age:{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
        Sex:{
            type:DataTypes.STRING,
            allowNull:false,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });

    CustomerInfo.associate = function (models) {
        models.CustomerInfo.belongsToMany(models.ShopInfo, {
            through:'CustomerInShop',
            foreignKey: {
                name: 'ShopId',
                allowNull: false
            }
        });
        models.CustomerInfo.belongsTo(models.CustomerInfo, {
            onDelete: "CASCADE",
            as:"RecommendCustomerInfo",
            foreignKey: {
              name: 'RecommendCustomerId',
              allowNull: true
            }
          });
          
      };
    return CustomerInfo;
}