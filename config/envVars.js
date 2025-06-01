import dotenv from 'dotenv';

dotenv.config();

export const ENV_VARS = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
   // MONGO_URI: process.env.MONGO_URI,   
    MONGO_URI: 'mongodb+srv://mokongmawdawa:6pRU6sHagZztg7B2@bolooplace.qheamtn.mongodb.net/?retryWrites=true&w=majority&appName=Bolooplace',   
    JWT_SECRET: 'my_super_secure_jwt_secret_key',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FAPSHI_API_USER: process.env.FAPSHI_API_USER,
    FAPSHI_API_KEY: process.env.FAPSHI_API_KEY, EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL: process.env.EMAIL,
    MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
    MAILTRAP_ENDPOINT: process.env.MAILTRAP_ENDPOINT,

}