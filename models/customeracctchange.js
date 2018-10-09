module.exports = (sequelize, DataTypes) => {
  var CustomerAccountChange = sequelize.define('CustomerAccountChange', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
    IndirectRecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ChargedMoney: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    CustomedMoney: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt'
  });
  CustomerAccountChange.associate = function (models) {
    models.CustomerAccountChange.belongsTo(models.ShopInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'ShopId',
        allowNull: false
      }
    });

    models.CustomerAccountChange.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'CustomerId',
        allowNull: false
      }
    });

    models.CustomerAccountChange.belongsTo(models.TransactionDetail, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'TransactionSeq',
        allowNull: false
      }
    });
  };
  return CustomerAccountChange;
}