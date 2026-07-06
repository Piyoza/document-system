CREATE TABLE users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT,
 email TEXT UNIQUE,
 password_hash TEXT,
 role TEXT
);

CREATE TABLE documents (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 vendor_name TEXT,
 invoice_number TEXT,
 invoice_date TEXT,
 amount REAL,
 vat REAL,
 status TEXT,
 file_url TEXT
);

CREATE TABLE approvals (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 document_id INTEGER,
 stage INTEGER,
 approver_id INTEGER,
 decision TEXT,
 comments TEXT,
 approved_at DATETIME
);