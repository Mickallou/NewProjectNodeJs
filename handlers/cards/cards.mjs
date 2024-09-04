import { app } from "../../app.mjs";
import { adminGuard, bussinessGuard, getUser, guard, guardUserOfCardOrAdmin } from "../../guard.mjs";
import { Card } from "./cards.model.mjs";
import { cardSchema } from "./cards.joi.mjs";

app.get("/cards", async (req, res) => {
    res.send(await Card.find());
});

app.get("/cards/my-cards", guard, async (req, res) => {
    const user = getUser(req);
    const myCards = await Card.find({ user_id: user.userId });
    res.send(myCards);
});

app.get("/cards/:id", async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send("Card not found");
        }
        res.send(card);
    } catch (err) {
        res.status(500).send("An error occurred while fetching the card.");
    }
});

app.post("/cards", bussinessGuard, async (req, res) => {
    const user = getUser(req);

    const { title, subtitle, description, phone, email, web, address: { state, country, city, street, houseNumber, zip }, image: { url, alt } } = req.body;

    const validate = cardSchema.validate(req.body);

    if (validate.error) {
        return res.status(403).send(validate.error.details[0].message);
    }

    const card = new Card({
        title,
        subtitle,
        description,
        phone,
        email,
        address: { state, country, city, street, houseNumber, zip },
        image: { url, alt },
        web,
        user_id: user.userId,
    });

    const newCard = await card.save();
    res.send(newCard);
});

app.put("/cards/:id", guard, async (req, res) => {
    try {
        const user = getUser(req);
        const cardId = req.params.id;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).send("Card not found");
        }

        if (card.user_id.toString() !== user.userId.toString()) {
            return res.status(403).send("You are not authorized to modify this card");
        }

        const { title, subtitle, description, phone, email, web, address: { state, country, city, street, houseNumber, zip }, image: { url, alt } } = req.body;

        const validate = cardSchema.validate(req.body);
        if (validate.error) {
            return res.status(403).send(validate.error.details[0].message);
        }

        card.title = title;
        card.subtitle = subtitle;
        card.description = description;
        card.phone = phone;
        card.email = email;
        card.address = { state, country, city, street, houseNumber, zip };
        card.image = { url, alt };
        card.web = web;

        const updatedCard = await card.save();
        res.send(updatedCard);
    } catch (err) {
        console.error(err);
        res.status(500).send("Your not autorized to modify this card");
    }
});

app.patch("/cards/:id", guard, async (req, res) => {
    try {
        const user = getUser(req);
        const card = await Card.findById(req.params.id);
        
        if (!card) {
            return res.status(404).send("Card not found");
        }

        if (!card.liked.includes(user.userId)) {
            card.liked.push(user.userId);
        }

        const updatedCard = await card.save();
        res.send(updatedCard);
    } catch (err) {
        console.error("Error updating card:", err.message);
        res.status(500).send("An error occurred while updating the card.");
    }
});

app.delete("/cards/:id", guardUserOfCardOrAdmin, async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) {
            return res.status(404).send("Card not found");
        }
        res.send("Card deleted successfully");
    } catch (err) {
        res.status(500).send("An error occurred while deleting the card.");
    }
});

app.patch("/cards/changeBiz/:id/:newBiz", adminGuard, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        const newBiz = req.params.newBiz;

        if (!card) {
            return res.status(404).send("Card not found");
        }

        card.bizNumber = newBiz;
        const updatedCard = await card.save();
        res.send(updatedCard);
    } catch (err) {
        console.error("Error updating card:", err.message);
        res.status(500).send("An error occurred while updating the card.");
    }
});