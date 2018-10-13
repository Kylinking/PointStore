module.exports = (sequelize, DataTypes) => {
  var TransactionDetail = sequelize.define('TransactionDetail', {
    TransactionSeq: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    RecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    IndirectRecommendPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ShopBounusPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CustomedPoints: {
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
    PointToMoneyRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  }, {
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt'
  });

  TransactionDetail.associate = function (models) {
    models.TransactionDetail.belongsTo(models.ShopInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'ShopId',
        allowNull: false
      }
    });

    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'CustomerId',
        allowNull: false
      }
    });

    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      as: 'RecommendCustomer',
      foreignKey: {
        name: 'RecommendCustomerId',
        allowNull: true
      }
    });
    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      as: 'IndirectRecommendCustomer',
      foreignKey: {
        name: 'IndirectRecommendCustomerId',
        allowNull: true
      }
    });
  };

  return TransactionDetail;
}