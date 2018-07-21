'use strict';

module.exports = (sequelize, DataTypes)=>{
    var ShopInfo = sequelize.define('ShopInfo',{
        ShopID:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
        },
        Name:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        Phone:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        Address:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        Status:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
    });

    return ShopInfo;
}