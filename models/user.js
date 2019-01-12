module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        Role: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        Password: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });
    return User;
}