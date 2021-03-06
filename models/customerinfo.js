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
            unique: "phone_shopid",
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
        models.CustomerInfo.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopId',
            allowNull: false,
            unique: "phone_shopid"
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