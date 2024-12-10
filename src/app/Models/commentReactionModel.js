// src/app/Models/commentReactionModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CommentReaction = sequelize.define('CommentReaction', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'member',
                key: 'member_id'
            }
        },
        comment_user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        timestamp: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        reaction: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: [['like', 'dislike']]
            }
        }
    }, {
        tableName: 'comment_reactions',
        timestamps: false
    });

    return CommentReaction;
};


// đây là bảng mởí được thêm vào để lưu trữ các phản hồi của người dùng đối với bình luận. Bảng này bao gồm các trường sau:
// user_id: ID của người dùng phản hồi
// comment_user_id: ID của người dùng đã bình luận
// timestamp: Thời gian phản hồi
// reaction: Phản hồi của người dùng (like hoặc dislike)
// Trong đó, user_id và comment_user_id là khóa chính của bảng. Bảng này sẽ được sử dụng để lưu trữ thông tin về việc người 
// dùng thích hoặc không thích bình luận của người khác. 
// Điều này giúp hệ thống chỉ cho phép 1 người chỉ có thể like, dislike 1 bình luận 1 lần duy nhất.