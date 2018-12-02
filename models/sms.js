'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ShortMessageInfo', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CustomerName: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        ShopName: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        Phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        Template: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        SignName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Content:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        Date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        Result: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        Status:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });
}