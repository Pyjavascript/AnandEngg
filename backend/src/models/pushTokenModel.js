const db = require('../config/db');

let pushTokenTablePromise = null;

async function ensurePushTokenTable() {
  if (pushTokenTablePromise) return pushTokenTablePromise;

  pushTokenTablePromise = (async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_push_tokens (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(512) NOT NULL,
        platform VARCHAR(32) NOT NULL DEFAULT 'android',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_push_token (token),
        INDEX idx_push_token_user (user_id)
      )
    `);
    return true;
  })();

  return pushTokenTablePromise;
}

exports.upsertToken = async ({ userId, token, platform = 'android' }) => {
  await ensurePushTokenTable();
  const [result] = await db.query(
    `INSERT INTO user_push_tokens (user_id, token, platform)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id),
       platform = VALUES(platform),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, token, platform],
  );
  return result;
};

exports.deleteToken = async ({ token, userId = null }) => {
  await ensurePushTokenTable();
  if (userId) {
    const [result] = await db.query(
      `DELETE FROM user_push_tokens WHERE token = ? AND user_id = ?`,
      [token, userId],
    );
    return result;
  }

  const [result] = await db.query(
    `DELETE FROM user_push_tokens WHERE token = ?`,
    [token],
  );
  return result;
};

exports.deleteTokens = async tokens => {
  await ensurePushTokenTable();
  if (!Array.isArray(tokens) || tokens.length === 0) return null;
  const placeholders = tokens.map(() => '?').join(', ');
  const [result] = await db.query(
    `DELETE FROM user_push_tokens WHERE token IN (${placeholders})`,
    tokens,
  );
  return result;
};

exports.listTokensByUserId = async userId => {
  await ensurePushTokenTable();
  const [rows] = await db.query(
    `SELECT token, platform
     FROM user_push_tokens
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
    [userId],
  );
  return rows;
};
