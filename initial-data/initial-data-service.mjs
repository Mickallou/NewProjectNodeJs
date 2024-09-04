import { User } from "../handlers/users/users.model.mjs";
import { initialData } from "./initial-data.mjs"
import { Card } from "../handlers/cards/cards.model.mjs";
import bcrypt from "bcrypt";


(async () => {
    const userAmount = await User.find().countDocuments();
    
    if (!userAmount) {
        const userIds = []

        for (const user of initialData.users) {
            const u = new User(user);

            u.password = await bcrypt.hash(u.password, 10);


            const obj = await u.save();
            
            if (obj.isBusiness) {
                userIds.push(obj._id);
            }
        }

        for (const card of initialData.cards) {
            const c = new Card(card);
            const i = Math.floor(Math.random() * userIds.length);
            c.user_id = userIds[i];
            await c.save();
        }
    }

})();