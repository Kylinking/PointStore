module.exports = (sequelize, DataTypes) => {
    var Permission = sequelize.define('Permission', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Action: {
            type: DataTypes.STRING,
            unique: 'actionToPath',
            allowNull: false,
        },
        Controller: {
            type: DataTypes.STRING,
            unique: 'actionToPath',
            allowNull: false,
        },
        Path: {
            type: DataTypes.STRING,
            unique: 'actionToPath',
            allowNull: false,
            comment: 'Regular Expression'
        }
    }, {
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    });

    return Permission;
}