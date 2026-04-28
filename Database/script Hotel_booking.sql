-- ============================================
-- 1. DROP TABLES (optional, for reset)
-- ============================================
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. CREATE TABLES
-- ============================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance'))
);

CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    room_id INT NOT NULL REFERENCES rooms(room_id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_cost NUMERIC(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

CREATE TABLE booking_services (
    booking_id INT REFERENCES bookings(booking_id),
    service_id INT REFERENCES services(service_id),
    quantity INT DEFAULT 1,
    PRIMARY KEY (booking_id, service_id)
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id),
    amount NUMERIC(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT NOW(),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed'
);

-- ============================================
-- 3. INSERT STATIC DATA (services + admin)
-- ============================================

INSERT INTO users (full_name, email, password_hash, role)
VALUES ('Admin User', 'admin@example.com', 'adminpass', 'admin');

INSERT INTO services (service_name, service_price)
VALUES
('Breakfast', 15.00),
('Airport Pickup', 40.00),
('Spa Access', 60.00),
('Gym Access', 10.00),
('Dinner Buffet', 25.00);

-- ============================================
-- 4. FUNCTION: GENERATE CUSTOMERS
-- ============================================

CREATE OR REPLACE FUNCTION generate_customers(count INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO users (full_name, email, password_hash, role)
    SELECT
        'Customer ' || i,
        'customer' || i || '@example.com',
        'hash' || i,
        'customer'
    FROM generate_series(1, count) AS s(i);
END;
$$ LANGUAGE plpgsql;

SELECT generate_customers(80);

-- ============================================
-- 5. FUNCTION: GENERATE ROOMS
-- ============================================

CREATE OR REPLACE FUNCTION generate_rooms(count INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO rooms (room_number, room_type, price_per_night, status)
    SELECT
        (100 + i)::text,
        (ARRAY['Single','Double','Suite'])[floor(random()*3)+1],
        (50 + random()*300)::numeric(10,2),
        'available'
    FROM generate_series(1, count) AS s(i);
END;
$$ LANGUAGE plpgsql;

SELECT generate_rooms(100);

-- ============================================
-- 6. FUNCTION: GENERATE BOOKINGS
-- ============================================

CREATE OR REPLACE FUNCTION generate_bookings(count INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO bookings (user_id, room_id, check_in, check_out, total_cost, status)
    SELECT
        (SELECT user_id FROM users WHERE role='customer' ORDER BY random() LIMIT 1),
        (SELECT room_id FROM rooms ORDER BY random() LIMIT 1),
        date '2026-01-01' + (random()*200)::int,
        date '2026-01-02' + (random()*200)::int,
        (80 + random()*400)::numeric(10,2),
        CASE WHEN random() > 0.3 THEN 'confirmed' ELSE 'pending' END
    FROM generate_series(1, count);
END;
$$ LANGUAGE plpgsql;

SELECT generate_bookings(10000);

-- ============================================
-- 7. FUNCTION: GENERATE BOOKING SERVICES
-- ============================================

CREATE OR REPLACE FUNCTION generate_booking_services()
RETURNS VOID AS $$
BEGIN
    INSERT INTO booking_services (booking_id, service_id, quantity)
    SELECT
        b.booking_id,
        s.service_id,
        (1 + random()*3)::int
    FROM bookings b
    JOIN services s ON random() > 0.7; -- 30% chance
END;
$$ LANGUAGE plpgsql;

SELECT generate_booking_services();

-- ============================================
-- 8. FUNCTION: GENERATE PAYMENTS
-- ============================================

CREATE OR REPLACE FUNCTION generate_payments()
RETURNS VOID AS $$
BEGIN
    INSERT INTO payments (booking_id, amount, payment_method)
    SELECT
        booking_id,
        total_cost,
        (ARRAY['credit_card','debit_card','paypal'])[floor(random()*3)+1]
    FROM bookings
    WHERE status = 'confirmed';
END;
$$ LANGUAGE plpgsql;

SELECT generate_payments();
