import mongoose from 'mongoose';

const reserve = new mongoose.Schema({
    eventType: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        required: true
    },
    targetId: {
        type: String,
        required: true
    },
    releaseInfo: {
        type: new mongoose.Schema({
            start: Date,
            end: Date
        }),
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    assets: {
        type: new mongoose.Schema({
            colorway: String,
            name: String,
            price: String,
            styleCode: String
        }),
        required: true
    }
})

export default mongoose.model('reserve', reserve);

