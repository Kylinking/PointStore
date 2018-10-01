module.exports = (sequelize, DataTypes) => {
  var ShopAccountChange = sequelize.define('ShopAccountChange', {
    ChargedPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CustomedPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ShopBounusPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    RecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },{
    updatedAt:'UpdatedAt',
    createdAt:'CreatedAt'
});
  ShopAccountChange.associate = function (models) {
    models.ShopAccountChange.belongsTo(models.ShopInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'ShopId',
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