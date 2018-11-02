module.exports = (sequelize, DataTypes) => {
  var TransactionDetail = sequelize.define('TransactionDetail', {
    TransactionSeq: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    ShopBounusPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
            defaultValue:0
    },
    CustomedPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    ChargedMoney: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CustomedMoney: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PointToMoneyRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    Reversal:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0
    },
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
    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      as: 'ThirdRecommendCustomer',
      foreignKey: {
        name: 'ThirdRecommendCustomerId',
        allowNull: true
      }
    });

      models.TransactionDetail.belongsTo(models.TransactionDetail, {
        onDelete: "CASCADE",
        foreignKey: {
          name: 'ReversalTransactionSeq',
          allowNull: true
        }
      });
  };

  return TransactionDetail;
}