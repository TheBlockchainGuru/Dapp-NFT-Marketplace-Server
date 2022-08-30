const mongoose = require('mongoose');
const schema = mongoose.Schema;

const historySchema = new schema({
    market: {
        type: String,
        required: true,
    },
    nft: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['List', 'Purchase'],
        required: true,
    },
    list: {
        type: String,
    },
    supply: {
        type: Number,
        required: true,
        default: 1
    },
    creator: {
        type: String,
        required: true,
    },
    endAt: {
        type: Date,
    },
    state: {
        type: String,
        required: true,
        default: "0"
    }
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
    },
    toObject: {
        virtuals: true
    }
})

historySchema.virtual('creatorInfo', {
    ref: 'wallets',
    localField: 'creator',
    foreignField: 'wallet',
    justOne: true
})

historySchema.virtual('nftInfo', {
    ref: 'nfts',
    localField: 'nft',
    foreignField: 'id',
    justOne: true
})

module.exports = Buy = mongoose.model('histories', historySchema);