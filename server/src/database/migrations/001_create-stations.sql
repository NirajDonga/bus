-- Up Migration

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    -- latitude DECIMAL(9,6),
    -- longitude DECIMAL(9,6)
);

-- Down Migration

DROP TABLE IF EXISTS stations CASCADE;
