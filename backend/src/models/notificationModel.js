const db = require('../config/db');

let notificationTablePromise = null;

async function ensureNotificationTable() {
  if (notificationTablePromise) return notificationTablePromise;

  notificationTablePromise = (async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_notifications (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(64) NOT NULL DEFAULT 'info',
        related_submission_id INT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notification_user (user_id),
        INDEX idx_notification_read (user_id, is_read)
      )
    `);
    return true;
  })();

  return notificationTablePromise;
}

exports.createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  relatedSubmissionId = null,
}) => {
  await ensureNotificationTable();
  const [result] = await db.query(
    `INSERT INTO app_notifications (user_id, title, message, type, related_submission_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, type, relatedSubmissionId],
  );
  return result;
};

exports.listUserNotifications = async userId => {
  await ensureNotificationTable();
  const [rows] = await db.query(
    `SELECT id, user_id, title, message, type, related_submission_id, is_read, created_at
     FROM app_notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  );
  return rows;
};

exports.markAllRead = async userId => {
  await ensureNotificationTable();
  const [result] = await db.query(
    `UPDATE app_notifications
     SET is_read = 1
     WHERE user_id = ? AND is_read = 0`,
    [userId],
  );
  return result;
};
