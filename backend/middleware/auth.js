

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

export const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Attach user info to request object
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization token required' });
    }
};
