import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})