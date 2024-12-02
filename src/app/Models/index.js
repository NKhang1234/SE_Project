const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config(); // Đảm bảo file .env được tải
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const db = {};

// Khởi tạo Sequelize sử dụng URL kết nối từ DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // Chỉ định kiểu cơ sở dữ liệu là PostgreSQL
    ssl: { require: true, rejectUnauthorized: false }, // Thiết lập SSL cho kết nối (dành cho Neon DB hoặc các cơ sở dữ liệu đám mây yêu cầu SSL)
});

// Đọc và nạp các mô hình
fs.readdirSync(__dirname)
    .filter(
        (file) =>
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
    )
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

// Định nghĩa mối quan hệ nếu có
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
