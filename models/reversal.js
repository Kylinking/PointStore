module.exports = (sequelize, DataTypes) => {
        var ReversalRecord = sequelize.define('ReversalRecord', {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            CustomerId:{
                type: DataTypes.INTEGER,
                allowNull: false
            }
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
        }

    return ReversalRecord;
}