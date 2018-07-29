module.exports = (sequelize, DataTypes) => {
    var ShopAccountChange = sequelize.define('ShopAccountChange', {
        PointsAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Date:{
            type:DataTypes.DATE,
            allowNull:false,
        }
    });
    ShopAccountChange.associate = function (models) {
        models.ShopAccountChange.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopID',
            allowNull: false
          }
        });
      };
      ShopAccountChange.associate = function (models) {
        models.ShopAccountChange.belongsTo(models.CustomerBookingDetails, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'CustomerID',
            allowNull: false
          }
        });
      };
   return ShopAccountChange;
}