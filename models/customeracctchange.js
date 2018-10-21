module.exports = (sequelize, DataTypes) => {
  var CustomerAccountChange = sequelize.define('CustomerAccountChange', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // ChargedPoints: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    CustomedPoints: {
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
    IndirectRecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    ThirdRecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    ChargedMoney: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue:0
    },
    CustomedMoney: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue:0
    },
    RemainPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
  },
  RemainMoney: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
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