// models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    username : { type: String, required: true }
});

module.exports = mongoose.model('File', fileSchema);
