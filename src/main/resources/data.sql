
-- Schéma avec contraintes (crée si pas existe)
CREATE TABLE IF NOT EXISTS category (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS customer (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  job VARCHAR(100),
  address VARCHAR(200),
  email VARCHAR(100) UNIQUE NOT NULL,
  creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  release_date DATE,
  total_examplaries INTEGER NOT NULL DEFAULT 1 CHECK (total_exemplaries >= 1),
  author VARCHAR(150) NOT NULL,
  category_code VARCHAR(50) NOT NULL REFERENCES category(code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS loan (
  book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  begin_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSE')),
  PRIMARY KEY (book_id, customer_id)
);

-- Seed data (INSERT IF NOT EXISTS pour éviter doublons)
INSERT INTO category (code, label) VALUES ('ROMAN', 'Roman') ON CONFLICT (code) DO NOTHING;
INSERT INTO category (code, label) VALUES ('SCIENCE', 'Science-fiction') ON CONFLICT (code) DO NOTHING;

INSERT INTO customer (first_name, last_name, job, address, email) VALUES ('Test', 'User', 'Dev', 'Rue Test', 'test@test.com') ON CONFLICT (email) DO NOTHING;
INSERT INTO customer (first_name, last_name, job, address, email) VALUES ('Miguel', 'Seumo', 'Student', 'Rue Miguel', 'miguel@example.com') ON CONFLICT (email) DO NOTHING;

INSERT INTO book (title, isbn, release_date, total_exemplaries, author, category_code) VALUES ('Test Book', '1234567890', '2025-01-01', 5, 'Test Author', 'ROMAN') ON CONFLICT (isbn) DO NOTHING;
INSERT INTO book (title, isbn, release_date, total_exemplaries, author, category_code) VALUES ('Sci-Fi Book', '0987654321', '2025-02-01', 3, 'Sci-Fi Author', 'SCIENCE') ON CONFLICT (isbn) DO NOTHING;

INSERT INTO loan (book_id, customer_id, begin_date, end_date, status) VALUES (1, 1, '2025-10-01', '2025-10-15', 'OPEN') ON CONFLICT (book_id, customer_id) DO NOTHING;