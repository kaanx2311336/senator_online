const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlm = require('../sqlm');

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_okey_online';

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username ve password gereklidir.' });
    }

    const existingUsers = await sqlm.listele('users', { username });
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await sqlm.ekle('users', {
      username,
      password_hash
    });

    res.status(201).json({ message: 'Kayıt başarılı', userId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username ve password gereklidir.' });
    }

    const users = await sqlm.listele('users', { username });
    if (users.length === 0) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Giriş başarılı', token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// POST /guest
router.post('/guest', async (req, res) => {
  try {
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    let username = `guest_${guestNumber}`;
    
    // Ensure username is unique
    let existingUsers = await sqlm.listele('users', { username });
    while (existingUsers.length > 0) {
      const newNumber = Math.floor(1000 + Math.random() * 9000);
      username = `guest_${newNumber}`;
      existingUsers = await sqlm.listele('users', { username });
    }

    const password = `guest_pass_${guestNumber}`;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await sqlm.ekle('users', {
      username,
      password_hash
    });

    const token = jwt.sign(
      { id: userId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Misafir girişi başarılı', token, user: { id: userId, username } });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
