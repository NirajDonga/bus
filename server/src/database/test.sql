-- 1. Create a Standard Bus Layout (Volvo 2+2 Semi-Sleeper)
INSERT INTO bus_layouts (name, total_seats, layout) VALUES 
(
    'Volvo Multi-Axle (40 Seats)', 
    40, 
    '{
        "lower_deck": [],
        "upper_deck": [
            {"id": "1A", "type": "sleeper", "row": 1, "col": 1},
            {"id": "1B", "type": "sleeper", "row": 1, "col": 2},
            {"id": "2A", "type": "seater", "row": 2, "col": 1},
            {"id": "2B", "type": "seater", "row": 2, "col": 2}
            -- (In a real app, you would list all 40 seats here)
        ]
    }'::jsonb
);

-- 2. Create Stations
INSERT INTO stations (name, city, state, latitude, longitude) VALUES 
('Surat Central', 'Surat', 'Gujarat', 21.1702, 72.8311),
('Mumbai Borivali', 'Mumbai', 'Maharashtra', 19.2307, 72.8567);

-- 3. Create a Bus (Linked to the Layout above)
-- We use a subquery to get the layout_id automatically
INSERT INTO buses (plate_number, operator_name, layout_id) VALUES 
(
    'GJ-05-BX-1234', 
    'Royal Travels', 
    (SELECT id FROM bus_layouts WHERE name = 'Volvo Multi-Axle (40 Seats)')
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
    40, -- Must match the layout count initially
    '[
        {"stop_id": 1, "arrival": "10:00", "departure": "10:15"},
        {"stop_id": 2, "arrival": "16:00", "departure": "16:00"}
    ]'::jsonb
);

-- 5. Create a Dummy User (So you can test booking)
INSERT INTO users (email, phone, password) VALUES 
('test@user.com', '9876543210', 'hashed_password_here');