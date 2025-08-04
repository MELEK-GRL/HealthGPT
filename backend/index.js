require('dotenv').config(); // .env dosyasını yükle

const express = require('express');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// ✅ Sağlık testi için test endpoint (önemli)
app.get('/ping', (req, res) => {
    res.send('pong');
});

// ✅ Auth route
app.use('/auth', authRoutes);

function isHealthRelated(text) {
    const keywords = ['kan', 'tahlil', 'demir', 'hemoglobin', 'doktor', 'hastalık'];
    return keywords.some(k => text.toLowerCase().includes(k));
}

// 📄 PDF endpoint
app.post('/upload', async (req, res) => {
    try {
        const { fileName, fileBase64 } = req.body;
        if (!fileName || !fileBase64)
            return res.status(400).json({ error: 'Eksik veri' });

        const buffer = Buffer.from(fileBase64, 'base64');
        const pdfData = await pdfParse(buffer);
        const text = pdfData.text;

        if (!isHealthRelated(text)) {
            return res.json({ answer: 'Yalnızca sağlıkla ilgili PDF’ler destekleniyor.' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Sen bir sağlık asistanısın.' },
                { role: 'user', content: `Tahlil sonuçlarını yorumla:\n\n${text}` },
            ],
        });

        res.json({ answer: completion.choices[0].message.content });
        console.log('--->completion', JSON.stringify(completion.choices[0].message.content, null, 2));
    } catch (err) {
        console.error('❌ Upload Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// 💬 Mesaj endpoint
app.post('/message', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Mesaj boş' });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Sen bir sağlık asistanısın.' },
                { role: 'user', content: message },
            ],
        });

        res.json({ answer: completion.choices[0].message.content });
        console.log('--->completion2', JSON.stringify(completion.choices[0].message.content, null, 2));
    } catch (err) {
        console.error('❌ Message Hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.listen(3001, () => {
    console.log('🩺 Backend çalışıyor');
});
