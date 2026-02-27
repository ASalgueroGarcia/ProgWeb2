//src/models/moveis.model.js

import mongoose from "mongoose"

const movieSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minlength: [2, 'Mínimo 2 caracteres'],
    },
    director: {
        type: String,
        required: true
    }, 
    year: {
        type: Number,
        min: 1888,
        max: () => new Date().getFullYear()
    },
    genre: {
        type: String,
        enum: ["action", "comedy", "drama", "horror", "scifi"],
        required: true
    },
    copies: {
        type: Number,
        default: 5
    },       
    availableCopies: {
        type: Number
    },
    timesRented: {
        type: Number,
        default: 0
    },
    cover: {
        type: String,
        default: null
    }
});

movieSchema.pre('save', function(next) {
    if (this.availableCopies === undefined) {
        this.availableCopies = this.copies;
    }
    next();
});

export default mongoose.model('Movie', movieSchema);