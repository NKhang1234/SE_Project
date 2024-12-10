const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Book = sequelize.define(
        'Book', {
            book_code: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            category_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'categories', // Tên bảng tham chiếu
                    key: 'category_id'
                }
            },
            book_img: {
                type: DataTypes.TEXT
            },
            book_title: {
                type: DataTypes.STRING(100)
            },
            book_provider: {
                type: DataTypes.STRING(100)
            },
            book_publisher: {
                type: DataTypes.STRING(100)
            },
            book_author: {
                type: DataTypes.STRING(100)
            },
            book_cover: {
                type: DataTypes.STRING(20)
            },
            book_category: {
                type: DataTypes.STRING
            },
            publish_date: {
                type: DataTypes.DATE
            },
            language: {
                type: DataTypes.STRING(20)
            },
            book_weight: {
                type: DataTypes.REAL
            },
            book_size: {
                type: DataTypes.STRING(40)
            },
            description: {
                type: DataTypes.TEXT
            },
            rating_score: {
                type: DataTypes.REAL
            }
        }, {
            tableName: 'book',
            timestamps: false
        });
    return Book;
};
