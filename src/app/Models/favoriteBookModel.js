const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FavoriteBook = sequelize.define('FavoriteBook', {
        member_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'member', // Tên bảng tham chiếu
                key: 'member_id'
            }
        },
        book_code: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'book', // Tên bảng tham chiếu
                key: 'book_code'
            }
        }
    }, {
        tableName: 'favorite_books',
        timestamps: false
    });

    return FavoriteBook;
};