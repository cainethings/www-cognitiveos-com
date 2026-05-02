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

CREATE TABLE IF NOT EXISTS memory_events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(191) NOT NULL,
    memory_type VARCHAR(100) NOT NULL,
    summary_text TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0,
    embedding JSON NOT NULL,
    source_message_id INT UNSIGNED NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_memory_events_user_id (user_id),
    INDEX idx_memory_events_memory_type (memory_type),
    INDEX idx_memory_events_active (active),
    INDEX idx_memory_events_created_at (created_at),
    INDEX idx_memory_events_user_created (user_id, created_at),
    INDEX idx_memory_events_source_message_id (source_message_id),
    CONSTRAINT fk_memory_events_source_message
        FOREIGN KEY (source_message_id) REFERENCES conversations(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
