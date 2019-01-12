'use strict';

module.exports = (sequelize, DataTypes)=>{
    var ShopInfo = sequelize.define('ShopInfo',{
        ShopId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        Name:{
            type:DataTypes.STRING,
            allowNull:false,
            unique: false,
        },
        Phone:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        Address:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        Status:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        Type:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        Contact:{
            type:DataTypes.STRING,
            allowNull:true,
            unique: false,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });
    ShopInfo.associate = function (models) {
        models.ShopInfo.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ParentShopId',
            allowNull: true
          }
        });
      };
    return ShopInfo;
}