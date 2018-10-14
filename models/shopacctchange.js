module.exports = (sequelize, DataTypes) => {
  var ShopAccountChange = sequelize.define('ShopAccountChange', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CustomedPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    ChargedMoney: {
      type: DataTypes.INTEGER,
      allowNull: false,
            defaultValue:0
    },
    CustomedMoney: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ShopBounusPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
            defaultValue:0
    },
    RecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
  }, {
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt'
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