module.exports = (sequelize, DataTypes) => {
    var ShopAccountInfo = sequelize.define('ShopAccountInfo', {
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        CustomedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ShopBounusPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        ChargedMoney:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        CustomedMoney: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });
   return ShopAccountInfo;
}