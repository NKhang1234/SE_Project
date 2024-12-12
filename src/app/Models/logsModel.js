const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Logs = sequelize.define('Logs', {
        log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user_account', // Tên bảng tham chiếu
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        }
    }, {
        tableName: 'logs',
        timestamps: false
    });

    return Logs;
};