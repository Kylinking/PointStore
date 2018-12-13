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