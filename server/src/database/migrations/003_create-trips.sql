-- Up Migration

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

CREATE INDEX idx_trips_search ON trips(departure_time, first_stop, last_stop);
CREATE INDEX idx_trips_sync ON trips(updated_at);

-- Down Migration

DROP INDEX IF EXISTS idx_trips_sync;
DROP INDEX IF EXISTS idx_trips_search;
DROP TABLE IF EXISTS trips CASCADE;
