module.exports = (sequelize, DataTypes) => {
    var Login = sequelize.define('Login', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        Password: {
            type: DataTypes.TEXT,
            primaryKey: false,
            allowNull: false,
        }
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    })
   return Login;
}
