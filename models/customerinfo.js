'use strict';

module.exports = (sequelize, DataTypes)=>{
    var CustomerInfo = sequelize.define('CustomerInfo',{
        CustomerID:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
        },
        Name:{
            type:DataTypes.TEXT,
            allowNull:true,
        },
        Phone:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        Address:{
            type:DataTypes.TEXT,
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
            type:DataTypes.TEXT,
            allowNull:false,
        },
    });

    return CustomerInfo;
}