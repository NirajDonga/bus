-- Up Migration

CREATE TABLE bus_layouts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    layout JSONB NOT NULL,          
    total_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    operator_name VARCHAR(50) NOT NULL,
    layout_id INT REFERENCES bus_layouts(id), 
    created_at TIMESTAMP DEFAULT NOW()
);

-- Down Migration

DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS bus_layouts CASCADE;
