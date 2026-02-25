CREATE TABLE IF NOT EXISTS conversations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(191) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_conversations_user_id (user_id),
    INDEX idx_conversations_created_at (created_at),
    INDEX idx_conversations_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

