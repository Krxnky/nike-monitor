import mongoose from 'mongoose';

const product = new mongoose.Schema({
    styleCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'Unknown',
        required: true
    },
    color: {
        type: String,
        default: '?',
        required: false
    },
    slug: {
        type: String,
        default: '?'
    },
    imageUrl: {
        type: String,
        default: 'https://icon-library.com/images/none-icon/none-icon-0.jpg',
        required: true
    },
    priceInfo: {
        type: new mongoose.Schema({
            price: Number,
            currency: {
                type: String,
                default: 'USD'
            }
        }),
        required: true
    },
    availabilityInfo: {
        type: new mongoose.Schema({
            status: String,
            visible: Boolean
        }),
        required: true
    },
    releaseInfo: {
        type: new mongoose.Schema({
            method: {
                type: String,
                default: 'N/A'
            },
            startDate: Date,
            exclusiveAccess: Boolean,
            channels: [String]
        }),
        required: false
    }
})

export default mongoose.model('product', product);

