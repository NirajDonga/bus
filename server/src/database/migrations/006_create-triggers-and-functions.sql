-- Up Migration

-- Automation: updated_at timestamp
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

-- Automation: seat inventory management
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

-- Automation: Elasticsearch real-time sync
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

-- Automation: cleanup worker
CREATE OR REPLACE PROCEDURE cleanup_expired_bookings()
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM bookings 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$;

-- Down Migration

DROP PROCEDURE IF EXISTS cleanup_expired_bookings;
DROP TRIGGER IF EXISTS trg_notify_elastic_sync ON trips;
DROP FUNCTION IF EXISTS notify_trip_change;
DROP TRIGGER IF EXISTS trg_update_seats ON tickets;
DROP FUNCTION IF EXISTS update_trip_seats;
DROP TRIGGER IF EXISTS trg_update_trips_time ON trips;
DROP TRIGGER IF EXISTS trg_update_bookings_time ON bookings;
DROP TRIGGER IF EXISTS trg_update_tickets_time ON tickets;
DROP FUNCTION IF EXISTS update_timestamp;
