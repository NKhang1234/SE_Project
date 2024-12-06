const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Rating = sequelize.define('Rating', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'member', // Tên bảng tham chiếu
                key: 'member_id'
            }
        },
        timestamp: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        rating_score: {
            type: DataTypes.REAL
        },
        book_code: {
            type: DataTypes.INTEGER,
            references: {
                model: 'book', // Tên bảng tham chiếu
                key: 'book_code'
            }
        }
    }, {
        tableName: 'rating',
        timestamps: false
    });

    return Rating;
};