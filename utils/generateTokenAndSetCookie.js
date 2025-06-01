import jwt from 'jsonwebtoken';
import { ENV_VARS } from '../config/envVars.js';

export const generateTokenAndSetCookie = (userId, res) => {
    try {
        const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: ENV_VARS.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict'
        })
    } catch (error) {
        console.log("Error in generateTokenAndSetCookie: ", error.message);
    }
}