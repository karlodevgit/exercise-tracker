const mongoose = require("mongoose");

const schema = mongoose.Schema({
    username: String,
    password: String,
    exerciseInfo: {
        type: String,
        duration: String,
        completedExercise: Boolean
    }
});

const User = mongoose.connection.useDb("Exercise_tracker").model("users", schema);
module.exports = User;