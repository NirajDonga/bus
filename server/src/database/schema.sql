-- DROP PROCEDURE IF EXISTS cleanup_expired_bookings;
-- DROP TRIGGER IF EXISTS trg_notify_elastic_sync ON trips;
-- DROP FUNCTION IF EXISTS notify_trip_change;
-- DROP TRIGGER IF EXISTS trg_update_seats ON tickets;
-- DROP FUNCTION IF EXISTS update_trip_seats;
-- DROP TRIGGER IF EXISTS trg_update_trips_time ON trips;
-- DROP TRIGGER IF EXISTS trg_update_bookings_time ON bookings;
-- DROP TRIGGER IF EXISTS trg_update_tickets_time ON tickets;
-- DROP FUNCTION IF EXISTS update_timestamp;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS trips CASCADE;
-- DROP TABLE IF EXISTS buses CASCADE;
-- DROP TABLE IF EXISTS bus_layouts CASCADE;
-- DROP TABLE IF EXISTS stations CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

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

-- 2. DYNAMIC SCHEDULE
CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,
    bus_id INT REFERENCES buses(id),
    first_stop INT REFERENCES stations(id),
    last_stop INT REFERENCES stations(id),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL, 
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    schedule JSONB NOT NULL,          
    status VARCHAR(20) DEFAULT 'scheduled',
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER DATA
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. SALES & BOOKINGS
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
    price_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed', 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (trip_id, seat_number) 
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_trips_search ON trips(departure_time, first_stop, last_stop);
CREATE INDEX idx_trips_sync ON trips(updated_at); -- Backup for Polling Sync

-- 6. AUTOMATION: UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_trips_time BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_bookings_time BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_tickets_time BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 7. AUTOMATION: SEAT INVENTORY MANAGEMENT
CREATE OR REPLACE FUNCTION update_trip_seats()
RETURNS TRIGGER AS $$ 
BEGIN  
    IF (TG_OP = 'INSERT') THEN
        UPDATE trips 
        SET available_seats = available_seats - 1 
        WHERE id = NEW.trip_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE trips 
        SET available_seats = available_seats + 1 
        WHERE id = OLD.trip_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'confirmed' AND NEW.status = 'cancelled') THEN
            UPDATE trips SET available_seats = available_seats + 1 WHERE id = NEW.trip_id;
        ELSIF (OLD.status = 'cancelled' AND NEW.status = 'confirmed') THEN
            UPDATE trips SET available_seats = available_seats - 1 WHERE id = NEW.trip_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seats
AFTER INSERT OR DELETE OR UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION update_trip_seats();

-- 8. AUTOMATION: ELASTICSEARCH REAL-TIME SYNC
CREATE OR REPLACE FUNCTION notify_trip_change() 
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('trip_updates', NEW.id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_elastic_sync
AFTER INSERT OR UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION notify_trip_change();

-- 9. AUTOMATION: CLEANUP WORKER
CREATE OR REPLACE PROCEDURE cleanup_expired_bookings()
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM bookings 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$;