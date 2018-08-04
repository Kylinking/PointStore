module.exports = (sequelize, DataTypes) => {
    var ShopAccountInfo = sequelize.define('ShopAccountInfo', {
        CustomedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChargedPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        ShopBounusPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
    });

    ShopAccountInfo.associate = function (models) {
        models.ShopAccountInfo.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name:"ShopID",
            allowNull: false
          }
        });
      };
   return ShopAccountInfo;
}