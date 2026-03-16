const pool = require('./dbConfig');

/**
 * Initializes the database tables if they do not exist.
 */
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        elo_rating INT DEFAULT 1000,
        gold INT DEFAULT 0,
        games_played INT DEFAULT 0,
        games_won INT DEFAULT 0,
        total_score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create rooms table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INT NOT NULL,
        status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
        max_players INT DEFAULT 4,
        bet_amount INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create games table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        hand_number INT DEFAULT 1,
        indicator_tile VARCHAR(50),
        okey_tile VARCHAR(50),
        current_turn INT,
        status ENUM('playing', 'finished') DEFAULT 'playing',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);

    // Create game_players table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS game_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT NOT NULL,
        user_id INT NOT NULL,
        seat_position INT CHECK (seat_position >= 0 AND seat_position <= 3),
        tiles JSON,
        score INT DEFAULT 0,
        is_connected BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create game_moves table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS game_moves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT NOT NULL,
        user_id INT NOT NULL,
        move_type ENUM('draw_pile', 'draw_discard', 'discard', 'declare_win') NOT NULL,
        tile_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create stats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        highest_score INT DEFAULT 0,
        total_hands INT DEFAULT 0,
        pairs_won INT DEFAULT 0,
        runs_won INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully.');
    connection.release();
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

/**
 * Inserts a record into a table.
 * @param {string} table - The table name.
 * @param {Object} data - The data to insert.
 * @returns {Promise<number>} - The ID of the inserted record.
 */
async function ekle(table, data) {
  const keys = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  const sql = \`INSERT INTO \${table} (\${keys}) VALUES (\${placeholders})\`;
  
  const [result] = await pool.query(sql, values);
  return result.insertId;
}

/**
 * Retrieves a record from a table by ID.
 * @param {string} table - The table name.
 * @param {number} id - The ID of the record to retrieve.
 * @returns {Promise<Object|null>} - The retrieved record or null if not found.
 */
async function getir(table, id) {
  const sql = \`SELECT * FROM \${table} WHERE id = ?\`;
  const [rows] = await pool.query(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Updates a record in a table by ID.
 * @param {string} table - The table name.
 * @param {number} id - The ID of the record to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<boolean>} - True if the record was updated, false otherwise.
 */
async function guncelle(table, id, data) {
  const updates = Object.keys(data).map(key => \`\${key} = ?\`).join(', ');
  const values = Object.values(data);
  values.push(id);
  const sql = \`UPDATE \${table} SET \${updates} WHERE id = ?\`;
  
  const [result] = await pool.query(sql, values);
  return result.affectedRows > 0;
}

/**
 * Deletes a record from a table by ID.
 * @param {string} table - The table name.
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<boolean>} - True if the record was deleted, false otherwise.
 */
async function sil(table, id) {
  const sql = \`DELETE FROM \${table} WHERE id = ?\`;
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
}

/**
 * Lists records from a table with optional conditions.
 * @param {string} table - The table name.
 * @param {Object} [conditions] - The conditions to filter by.
 * @returns {Promise<Array>} - An array of matching records.
 */
async function listele(table, conditions = {}) {
  let sql = \`SELECT * FROM \${table}\`;
  const values = [];
  
  const keys = Object.keys(conditions);
  if (keys.length > 0) {
    const whereClause = keys.map(key => \`\${key} = ?\`).join(' AND ');
    sql += \` WHERE \${whereClause}\`;
    values.push(...Object.values(conditions));
  }
  
  const [rows] = await pool.query(sql, values);
  return rows;
}

module.exports = {
  initDatabase,
  ekle,
  getir,
  guncelle,
  sil,
  listele
};
