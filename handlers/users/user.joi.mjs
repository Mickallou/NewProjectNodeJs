import Joi from "joi";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,30}$/;

export const UserLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const UserSignup = Joi.object({
    name: Joi.object({
        first: Joi.string().min(3).max(15).required().alphanum(),
        middle: Joi.string().allow(null, ''),
        last: Joi.string().min(3).max(15).required().alphanum(),
    }).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required().min(9).max(15).regex(/^[0-9]+$/),
    address: Joi.object({
        state: Joi.string().required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        houseNumber: Joi.string().required(),
        zip: Joi.string().required(),
    }).required(),
    image: Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().required(),
    }).required(),
    password: Joi.string().regex(passwordRegex).required(),
    isBusiness: Joi.boolean().optional(),
});