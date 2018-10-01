module.exports = (sequelize, DataTypes) => {
  var TransactionDetail = sequelize.define('TransactionDetail', {
    TransactionSeq: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ChargedPoints: {
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
    ShopBounusPoints: {
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
    }
  },{
    updatedAt:'UpdatedAt',
    createdAt:'CreatedAt'
});

  TransactionDetail.associate = function (models) {
    models.TransactionDetail.belongsTo(models.ShopInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'ShopID',
        allowNull: false
      }
    });

    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'CustomerID',
        allowNull: false
      }
    });

    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      as:'RecommendCustomer',
      foreignKey: {
        name: 'RecommendCustomerID',
        allowNull: true
      }
    });
    models.TransactionDetail.belongsTo(models.CustomerInfo, {
      onDelete: "CASCADE",
      as:'IndirectRecommendCustomer',
      foreignKey: {
        name: 'IndirectRecommendCustomerID',
        allowNull: true
      }
    });
  };

  return TransactionDetail;
}