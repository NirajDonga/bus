-- 1. Create a compact demo bus layout
INSERT INTO bus_layouts (name, total_seats, layout) VALUES 
(
    'Volvo Demo Coach (4 Seats)', 
    4, 
    '{
        "lower_deck": [],
        "upper_deck": [
            {"id": "1A", "type": "sleeper", "row": 1, "col": 1},
            {"id": "1B", "type": "sleeper", "row": 1, "col": 2},
            {"id": "2A", "type": "seater", "row": 2, "col": 1},
            {"id": "2B", "type": "seater", "row": 2, "col": 2}
        ]
    }'::jsonb
);

-- 2. Create Stations
INSERT INTO stations (name, city, state) VALUES 
('Surat Central', 'Surat', 'Gujarat'),
('Mumbai Borivali', 'Mumbai', 'Maharashtra');

-- 3. Create a Bus (Linked to the Layout above)
-- We use a subquery to get the layout_id automatically
INSERT INTO buses (plate_number, operator_name, layout_id) VALUES 
(
    'GJ-05-BX-1234', 
    'Royal Travels', 
    (SELECT id FROM bus_layouts WHERE name = 'Volvo Demo Coach (4 Seats)')
);

-- 4. Create a Trip
INSERT INTO trips (
    bus_id, 
    first_stop, 
    last_stop, 
    departure_time, 
    arrival_time, 
    status, 
    available_seats, 
    schedule
) VALUES (
    (SELECT id FROM buses WHERE plate_number = 'GJ-05-BX-1234'),
    (SELECT id FROM stations WHERE city = 'Surat'),
    (SELECT id FROM stations WHERE city = 'Mumbai'),
    NOW() + INTERVAL '1 day',      -- Departs tomorrow
    NOW() + INTERVAL '1 day 6 hours', -- 6 hour journey
    'scheduled',
    4,
    '[
        {"stop_id": 1, "arrival": "10:00", "departure": "10:15", "price": 0},
        {"stop_id": 2, "arrival": "16:00", "departure": "16:00", "price": 700}
    ]'::jsonb
);

-- 5. Create a Dummy User (So you can test booking)
INSERT INTO users (fullname, email, phone, password) VALUES 
('Test User', 'test@user.com', '9876543210', '$2b$10$m5FXqjSPf6GDYPLbUgIIZ.EKw8B0z3pL85EMgQceNMkvnJTug3Z7W');
