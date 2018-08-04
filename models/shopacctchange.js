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
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    models.ShopAccountChange.belongsTo(models.TransactionDetail, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'TransactionSeq',
        allowNull: false
      }
    });
  };
  return ShopAccountChange;
}