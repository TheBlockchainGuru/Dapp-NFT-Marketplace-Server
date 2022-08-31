const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    image: {
        type: String,
    },
    bio: {
        type: String,
    },
    facebook: {
        type: String,
    },
    instagram: {
        type: String,
    },
    twitter: {
        type: String
    },
    web: {
        type: String
    }
},  {
    timestamps: true,
    toJSON: { 
        virtuals: true,
    },
    toObject: {
        virtuals: true
    }
});

userSchema.virtual('wallets', {
    ref: 'wallets',
    localField: '_id',
    foreignField: 'user'
})

userSchema.index({'$**': 'text'});

module.exports = User = mongoose.model('users', userSchema);