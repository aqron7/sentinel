-- Schema is created by SQLModel.metadata.create_all().
-- This file adds FTS5 virtual tables and triggers for full-text search
-- across awards, solicitations, and patents.

CREATE VIRTUAL TABLE IF NOT EXISTS award_fts USING fts5(
    award_id UNINDEXED,
    recipient,
    description,
    program_name,
    summary,
    content='award',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS award_ai AFTER INSERT ON award BEGIN
    INSERT INTO award_fts(rowid, award_id, recipient, description, program_name, summary)
    VALUES (new.id, new.award_id, new.recipient, new.description, new.program_name, new.summary);
END;

CREATE TRIGGER IF NOT EXISTS award_ad AFTER DELETE ON award BEGIN
    INSERT INTO award_fts(award_fts, rowid, award_id, recipient, description, program_name, summary)
    VALUES ('delete', old.id, old.award_id, old.recipient, old.description, old.program_name, old.summary);
END;

CREATE TRIGGER IF NOT EXISTS award_au AFTER UPDATE ON award BEGIN
    INSERT INTO award_fts(award_fts, rowid, award_id, recipient, description, program_name, summary)
    VALUES ('delete', old.id, old.award_id, old.recipient, old.description, old.program_name, old.summary);
    INSERT INTO award_fts(rowid, award_id, recipient, description, program_name, summary)
    VALUES (new.id, new.award_id, new.recipient, new.description, new.program_name, new.summary);
END;

CREATE VIRTUAL TABLE IF NOT EXISTS solicitation_fts USING fts5(
    notice_id UNINDEXED,
    title,
    description,
    summary,
    content='solicitation',
    content_rowid='id'
);

CREATE VIRTUAL TABLE IF NOT EXISTS patent_fts USING fts5(
    patent_number UNINDEXED,
    assignee,
    title,
    abstract,
    content='patent',
    content_rowid='id'
);
