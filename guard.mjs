import jwt from 'jsonwebtoken';
import { Card } from './handlers/cards/cards.model.mjs';

export const guard = (req, res, next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            res.status(401).send("User is not authenticated");
            return;
        } else {
            next();
        }
    }) 
}

export const bussinessGuard = (req, res, next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            res.status(401).send("User is not authenticated");
            return;
        } else {
            if (data.isBusiness) {
                next();
            } else {
                res.status(403).send("User is not authorized");
            }
        }
    }) 
}

export const adminGuard = (req, res, next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            res.status(401).send("User is not authenticated");
            return;
        } else {
            if (data.isAdmin) {
                next();
            } else {
                res.status(403).send("User is not authorized");
            }
        }
    }) 
}

export const getUser = (req) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return null;
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return user;
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return null;
    }
}

export const authorizeOwner = (req, res, next) => {
    guard(req, res, () => {
        const user = getUser(req);
        const userId = req.params.id;

        if (user.userId !== userId) {
            return res.status(403).send("You are not authorized to modify this user");
        }

        next();
    });
};

export const applyGuardOrAdminGuard = (req, res, next) => {
    const user = getUser(req);

    if (user === null || user.isAdmin === null) {
        return res.status(403).send("Unable to determine if you connected, please log in again");
    }

    if (user.isAdmin) {
        return adminGuard(req, res, next);
    } else {
        return guard(req, res, next);
    }
};

export const guardUserOfCardOrAdmin = async (req, res, next) => {
    try {
        const user = getUser(req);
        const cardId = req.params.id;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).send("Card not found");
        }

        if (user.isAdmin) {
            return next();
        }

        if (card.user_id.toString() !== user.userId.toString()) {
            return res.status(403).send("You are not authorized to modify this card");
        }

        next();
    } catch (err) {
        console.error("Error finding card:", err.message);
        res.status(500).send("An error occurred while trying to authorize the user.");
    }
};
