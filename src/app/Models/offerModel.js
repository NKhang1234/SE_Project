const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Offer = sequelize.define(
        'Offer',
        {
            publisher_id: {
                type: DataTypes.INTEGER,
                allownull: false,
                primaryKey: true,
            },
            offer_id: {
                type: DataTypes.INTEGER,
                allownull: false,
                primaryKey: true,
            },
            book_img: {
                type: DataTypes.INTEGER,
            },
            book_code: {
                type: DataTypes.INTEGER,
            },
            book_title: {
                type: DataTypes.STRING,
                allownull: false,
            },
            book_author: {
                type: DataTypes.STRING,
            },
            book_category: {
                type: DataTypes.STRING,
            },
            language: {
                type: DataTypes.STRING,
            },
            publish_date: {
                type: DataTypes.DATE,
            },
            base_price: {
                type: DataTypes.FLOAT,
            },
            number_of_discount: {
                type: DataTypes.INTEGER,
            },
            status: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'offer',
            timestamps: false,
        }
    );
    return Offer;
};
