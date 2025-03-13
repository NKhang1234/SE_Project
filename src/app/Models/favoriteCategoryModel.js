// CREATE TABLE favorite_categories (
// 	member_id INTEGER,
// 	category_id INTEGER,
// 	PRIMARY KEY (member_id, category_id),
// 	FOREIGN KEY (member_id) REFERENCES member(member_id),
// 	FOREIGN KEY (category_id) REFERENCES category(category_id)
// );

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FavoriteCategory = sequelize.define('FavoriteCategory', {
        member_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'member', // Tên bảng tham chiếu
                key: 'member_id'
            }
        },
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'category', // Tên bảng tham chiếu
                key: 'category_id'
            }
        }
    }, {
        tableName: 'favorite_categories',
        timestamps: false
    });    

    return FavoriteCategory;
}