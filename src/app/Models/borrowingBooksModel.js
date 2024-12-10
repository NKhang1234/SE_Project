const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BorrowingBooks = sequelize.define(
        'BorrowingBooks', {
            member_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: {
                    model: 'member',
                    key: 'member_id'
                }
            },
            book_code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: {
                    model: 'book',
                    key: 'book_code'
                }
            },
            borrow_date: {
                type: DataTypes.DATE
            },
            return_date: {
                type: DataTypes.DATE
            }

        }, {
            tableName: 'borrowing_books',
            timestamps: false
        });
    return BorrowingBooks;
}