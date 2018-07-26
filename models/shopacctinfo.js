module.exports = (sequelize, DataTypes) => {
    var ShopAccountInfo = sequelize.define('ShopAccountInfo', {
        ConsumedBounus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommentBounus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        LastdayShopBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        LastdayRecommentBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        ChargedPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        LastdayChargedBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        LastdayConsumedBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        }
    });
   return ShopAccountInfo;
}