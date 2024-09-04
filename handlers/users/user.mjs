import { app } from "../../app.mjs";
import { User } from "./users.model.mjs";
import { getUser, adminGuard, applyGuardOrAdminGuard, authorizeOwner } from "../../guard.mjs";
import { UserSignup } from "./user.joi.mjs";
import bcrypt from "bcrypt";


app.get("/users", adminGuard, async (req, res) => {
    res.send(await User.find());
});

app.get("/users/:id", applyGuardOrAdminGuard, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send("User not found"); 
        }

        const currentUser = getUser(req); 

        if (currentUser.isAdmin || user._id.equals(currentUser._id)) {
            return res.send(user);
        } else {
            return res.status(403).send("You are not authorized to view this user");
        }
    } catch (error) {
        res.status(404).send("User not found");
}
});

app.put("/users/:id", authorizeOwner, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(403).send("User not found");

    const { error } = UserSignup.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    user.set(req.body);
    await user.save();

    res.send(user);
});

app.patch("/users/:id", authorizeOwner, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(403).send("User not found");

    user.isBusiness = !user.isBusiness;
    await user.save();

    res.send(user.isBusiness);
});

app.delete("/users/:id", applyGuardOrAdminGuard, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send("User successfully deleted");
});
