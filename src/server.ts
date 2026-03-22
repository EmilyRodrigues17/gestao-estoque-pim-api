import express from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})