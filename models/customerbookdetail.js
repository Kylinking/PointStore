module.exports = (sequelize, DataTypes) => {
    var CustomerBookingDetails = sequelize.define('CustomerBookingDetails', {
        CustomerBookingSeq: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        },
        RecommentBounus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        LastdayShopBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        LastdayRecommentBounus:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        ChargedPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        LastdayChargedBounus:{
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
   return CustomerBookingDetails;
}