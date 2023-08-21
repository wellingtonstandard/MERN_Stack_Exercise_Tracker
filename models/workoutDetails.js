const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for workouts

const DetailsSchema = new Schema({
        username: {type: String, required: true},
        date: {type: Date, required: true},
        title: {type: String, required: true},
        movement: [{type: String, required: true}],
        sets: [{type: String, required: false}],
        reps: [{type: String, required: false}],
        rest: [{type: String, required: false}],
        notes: [{type: String, required: false}]
});

const Details = mongoose.model('workoutDetails', DetailsSchema);

module.exports = Details;