const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Related_book = sequelize.define(
        'Related_book', {
            book_code: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            related_book_code: {
                type: DataTypes.INTEGER,
            },
        }, {
            tableName: 'related_book',
            timestamps: false
        });
    return Related_book;
};
