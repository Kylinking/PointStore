module.exports = (sequelize, DataTypes) => {
    var CustomerBookingDetails = sequelize.define('CustomerBookingDetails', {
        CustomerBookingSeq: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        },
        PointsAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommentPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        IndirectRecommentPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ShopBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        Type:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        Date:{
            type:DataTypes.INTEGER,
            allowNull:false,
        }
    });

    CustomerBookingDetails.associate = function (models) {
        models.CustomerBookingDetails.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopID',
            allowNull: false
          }
        });
      };
    CustomerBookingDetails.associate = function (models) {
        models.CustomerBookingDetails.belongsTo(models.CustomerInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'CustomerID',
            allowNull: false
          }
        });
      };
      CustomerBookingDetails.associate = function (models) {
        models.CustomerBookingDetails.belongsTo(models.CustomerInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'RecommendCustomerID',
            allowNull: false
          }
        });
      };
      CustomerBookingDetails.associate = function (models) {
        models.CustomerBookingDetails.belongsTo(models.CustomerInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'IndirectRecommendCustomerID',
            allowNull: false
          }
        });
      };
   return CustomerBookingDetails;
}