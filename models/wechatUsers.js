'use strict';
module.exports = (sequelize, DataTypes) => {
    let WechatUser = sequelize.define('WechatUser', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        WechatId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'wechat_customerid',
        },
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });
    WechatUser.associate = function (models) {
        models.WechatUser.belongsTo(models.CustomerInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'CustomerId',
                allowNull: null,
                unique:'wechat_customerid'
            }
        });
    }
    return WechatUser;
}