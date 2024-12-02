const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Offer = sequelize.define(
        'Offer',
        {
            Book_img: {
                type: DataTypes.STRING,
            },
            Book_code: {
                type: DataTypes.STRING,
            },
            Book_title: {
                type: DataTypes.STRING,
                allownull: false,
            },
            Book_author: {
                type: DataTypes.STRING,
            },
            Book_category: {
                type: DataTypes.STRING,
            },
            Language: {
                type: DataTypes.STRING,
            },
            Book_publisher: {
                type: DataTypes.STRING,
            },
            Public_data: {
                type: DataTypes.TIME,
            },
            Base_price: {
                type: DataTypes.INTEGER,
            },
            Number_of_discount: {
                type: DataTypes.INTEGER,
            },
            Discount: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'Offer',
        }
    );
    return Offer;
};
