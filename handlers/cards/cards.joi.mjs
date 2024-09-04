import Joi from "joi";

export const cardSchema = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().required(),
    phone: Joi.string().required().min(9).max(15).regex(/^[0-9]+$/),
    email: Joi.string().email().required(),
    web: Joi.string().uri().optional(),
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
});

