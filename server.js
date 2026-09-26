import express from "express";
import dotenv from "dotenv";
import ImageKit from "@imagekit/nodejs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImageKit
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

// Menampilkan website
app.use(express.static(__dirname));

// Endpoint autentikasi ImageKit
app.get("/auth", (req, res) => {
    try {
        const authParams = imagekit.helper.getAuthenticationParameters();

        res.json(authParams);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Gagal membuat authentication ImageKit"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});