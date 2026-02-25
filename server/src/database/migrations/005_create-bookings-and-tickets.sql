-- Up Migration

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    trip_id BIGINT REFERENCES trips(id),
    status VARCHAR(20) DEFAULT 'pending', 
    payment_id VARCHAR(100),          
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    trip_id BIGINT REFERENCES trips(id),
    seat_number VARCHAR(10) NOT NULL,
    passenger_name VARCHAR(100),
    passenger_age INT,
    passenger_gender VARCHAR(10),
    board_seq INT NOT NULL,
    drop_seq INT NOT NULL,
    price_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed', 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);

-- Down Migration

DROP INDEX IF EXISTS idx_tickets_booking_id;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
