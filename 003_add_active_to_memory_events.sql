ALTER TABLE memory_events
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 AFTER source_message_id,
ADD INDEX idx_memory_events_active (active);
