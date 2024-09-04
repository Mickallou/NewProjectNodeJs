import { app } from "../../app.mjs";
import { User } from "./users.model.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserLogin, UserSignup } from "./user.joi.mjs";


app.post("/users/login", async (req, res) => {
    const { email, password } = req.body;
    const validate = UserLogin.validate({ email, password });

    if(validate.error) {
        return res.status(403).send(validate.error.details[0].message);
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(403).send("Email or Password is incorrect");
    }

    if (user.isLocked()) {
        return res.status(403).send("Account is locked due to too many failed login attempts. Try again later.");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
        await user.incrementLoginAttempts();

        if (user.loginAttempts + 1 >= 3) {
            await user.updateOne({
                $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }
            });
            return res.status(403).send("Account locked due to too many failed login attempts. Try again in 24 hours.");
        }

        return res.status(403).send("Email or Password is incorrect");
    }

    await user.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });

    const token = jwt.sign({ 
        userId: user._id, 
        firstName: user.name.first,
        lastName: user.name.last,
        isBusiness: user.isBusiness,
        isAdmin: user.isAdmin,
    }, process.env.JWT_SECRET, { expiresIn: '1h'} );

    res.send(token);
});

app.post("/users", async (req, res) => {
    const { name: {first, last, middle}, email, phone, image: {url, alt}, address: {state, country, city, street, houseNumber, zip}, password, isBusiness } = req.body;

    const validate = UserSignup.validate(req.body);

    if(validate.error) {
        return res.status(403).send(validate.error.details[0].message);
    }

    if (await User.findOne({ email })) {
        res.status(403).send("Email already exists");
        return;
    }

    const user = new User({
        name: { first, last, middle },
        email,
        phone,
        image: { url, alt },
        address: { state, country, city, street, houseNumber, zip },
        isBusiness,
        password: await bcrypt.hash(password, 10),
    });

    const newUser = await user.save();

    res.send(newUser);
});