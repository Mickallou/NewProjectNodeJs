import mongoose, { Schema } from "mongoose";

const Name = new Schema({
    first: String,
    middle: String,
    last: String,
});

const Image = new Schema({
    url: String,
    alt: String,
});

const Address = new Schema({
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: String,
    zip: String,
});

const schema = new Schema({
    name: Name,
    phone: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    image: Image,
    address: Address,
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBusiness: {
        type: Boolean,
        default: false,
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}); 

schema.methods.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    return this.updateOne({ $inc: { loginAttempts: 1 } });
};

schema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

export const User = mongoose.model('users', schema);