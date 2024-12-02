const connectDB = async (sequelize) => {
    try {
        await sequelize.authenticate();
        console.log(
            'Sequelize database connection has been established successfully.'
        );
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = connectDB;
