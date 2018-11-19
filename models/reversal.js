module.exports = (sequelize, DataTypes) => {
        var ReversalRecord = sequelize.define('ReversalRecord', {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        }, {
            updatedAt: 'UpdatedAt',
            createdAt: 'CreatedAt'
        });
        ReversalRecord.associate = function (models) {
            models.ReversalRecord.belongsTo(models.TransactionDetail, {
              onDelete: "CASCADE",
              foreignKey: {
                name: 'ReversalTransactionSeq',
                allowNull: false
              }
            });
            models.ReversalRecord.belongsTo(models.TransactionDetail, {
                onDelete: "CASCADE",
                foreignKey: {
                  name: 'OrignTransactionSeq',
                  allowNull: false
                }
              });
            models.ReversalRecord.belongsTo(models.CustomerInShop, {
                onDelete: "CASCADE",
                foreignKey: {
                  name: 'CustomerInShopId',
                  allowNull: false
                }
              });
        }

    return ReversalRecord;
}