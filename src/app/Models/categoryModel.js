const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define(
        'Category', {
            category_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            category_name: {
                type: DataTypes.STRING,
            },
            category_img: {
                type: DataTypes.TEXT
            },
        }, {
            tableName: 'category',
            timestamps: false
        });
    return Category;
};
