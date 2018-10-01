'use strict';

module.exports = (sequelize, DataTypes)=>{
    var CustomerInfo = sequelize.define('CustomerInfo',{
        CustomerID:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true,
        },
        Name:{
            type:DataTypes.STRING,
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
        models.CustomerInfo.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopID',
            allowNull: false
          }
        });

        models.CustomerInfo.belongsTo(models.CustomerInfo, {
            onDelete: "CASCADE",
            as:"RecommendCustomerInfo",
            foreignKey: {
              name: 'RecommendCustomerID',
              allowNull: true
            }
          });
      };
    return CustomerInfo;
}