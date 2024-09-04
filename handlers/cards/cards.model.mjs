import mongoose, { Schema } from "mongoose";

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
    title: String,
    subtitle: String,
    description: String,
    phone: String,
    email: String,
    web: String,
    image: Image,
    address: Address,
    bizNumber: String,
    liked: {
        type: [Schema.Types.ObjectId],
        default: [],
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
    }
});

export const Card = mongoose.model('cards', schema);