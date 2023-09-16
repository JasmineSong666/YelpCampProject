const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,h_200,w_200');
});
ImageSchema.virtual('tidy').get(function () {
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>
    <div>${this.location}</div>
    <div>$${this.price}</div>
    <div>${this.description.substring(0, 20)}...</div>`
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) { //.reviews.length
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})


module.exports = mongoose.model('campground', campgroundSchema);