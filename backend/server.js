require('dotenv').config(); // .env dosyasını yükle

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // ✅ eklendi
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const authRoutes = require('./routes/auth'); // ✅ eklendi

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// ✅ Auth endpoint
app.use('/auth', authRoutes);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function isHealthRelated(text) {
    const keywords = ['kan', 'tahlil', 'demir', 'hemoglobin', 'doktor', 'hastalık'];
    return keywords.some(k => text.toLowerCase().includes(k));
}

// ... (PDF ve mesaj endpoint'lerin değişmeden duracak)

app.listen(3001, () => {
    console.log('🩺 Backend çalışıyor: http://localhost:3001');
});
