import 'dotenv/config';
import express from 'express';
import { openWebPage, cerrarBrowser } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/api/horas/:nickname', async (req, res) => {
    const { nickname } = req.params;

    if (!nickname?.trim()) {
        return res.status(400).json({ error: 'Nickname requerido' });
    }

    try {
        const horas = await openWebPage(nickname.trim());

        if (!horas?.length) {
            return res.status(404).json({ error: 'Sin registros', nickname });
        }

        return res.json({ nickname, horas });

    } catch (err) {
        return res.status(500).json({ error: 'Error al consultar' });
    }
});

process.on('SIGINT', async () => { await cerrarBrowser(); process.exit(); });
process.on('SIGTERM', async () => { await cerrarBrowser(); process.exit(); });

app.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`🚀 Servidor en puerto ${PORT}`));