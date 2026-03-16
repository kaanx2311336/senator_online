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

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token gereklidir.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token.' });
    req.user = user;
    next();
  });
}

// GET /profile/:id
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await sqlm.getir('users', userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    
    // Güvenlik için şifre bilgisini çıkaralım
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// PUT /profile/avatar
router.put('/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar gereklidir.' });
    }
    
    const success = await sqlm.guncelle('users', userId, { avatar });
    
    if (!success) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı veya güncellenemedi.' });
    }
    
    res.json({ message: 'Avatar başarıyla güncellendi.' });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /stats/:id
router.get('/stats/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const statsList = await sqlm.listele('stats', { user_id: userId });
    
    if (statsList.length === 0) {
      return res.status(404).json({ error: 'İstatistik bulunamadı.' });
    }
    
    res.json(statsList[0]);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const leaderboard = await sqlm.getLeaderboard(limit);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
