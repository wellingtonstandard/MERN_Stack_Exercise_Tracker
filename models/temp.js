const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TempSchema = new Schema({
    username: {type: String, required: true},
    accesstoken: {type: String, required: true}
})

const Temp = mongoose.model('temp_token', TempSchema);

module.exports = Temp;