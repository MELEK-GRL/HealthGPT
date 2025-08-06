const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ✅ Kayıt
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔒 Aynı e-posta kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Kayıt başarısız',
                message: 'Bu e-posta zaten kayıtlı.',
            });
        }

        // 🧾 Yeni kullanıcı oluştur
        const user = await User.create({ name, email, password });

        // 🪪 JWT oluştur
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // ✅ Geriye _id dahil tüm bilgiler gönder
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(400).json({
            error: 'Kayıt başarısız',
            details: err.message,
        });
    }
});

// ✅ Giriş
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 📩 Kullanıcıyı e-posta ile bul
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                error: 'Giriş başarısız',
                message: 'Geçersiz e-posta ya da şifre.',
            });
        }

        // 🪪 JWT oluştur
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // ✅ Geriye _id dahil tüm bilgiler gönder
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({
            error: 'Sunucu hatası',
            details: err.message,
        });
    }
});

module.exports = router;
