'use strict';

module.exports = (sequelize, DataTypes)=>{
    var ShopInfo = sequelize.define('ShopInfo',{
        ShopID:{
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
            allowNull:false,
            unique: true,
        },
        Address:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        Status:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
    });

    return ShopInfo;
}