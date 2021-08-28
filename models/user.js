const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    sem:{
        type: Number,
        required: true
    },
    book:[{
        pageno: Number,
        content: []

    }]
},{strict: false});

const user = mongoose.model('user',userSchema);

module.exports = user;