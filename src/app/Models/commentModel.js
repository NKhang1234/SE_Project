const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
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
        content: {
            type: DataTypes.TEXT
        },
        number_of_like: {
            type: DataTypes.INTEGER
        },
        number_of_dislike: {
            type: DataTypes.INTEGER
        },
        book_code: {
            type: DataTypes.INTEGER,
            references: {
                model: 'book', // Tên bảng tham chiếu
                key: 'book_code'
            }
        }
    }, {
        tableName: 'comment',
        timestamps: false
    });

    return Comment;
};