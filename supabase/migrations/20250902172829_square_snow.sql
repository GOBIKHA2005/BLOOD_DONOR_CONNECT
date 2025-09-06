-- Blood Donor Management System Database Schema
-- Database: blood_donor_connect

-- Create database (run this first)
-- CREATE DATABASE blood_donor_connect;
-- USE blood_donor_connect;

-- Drop existing table if exists (for development)
DROP TABLE IF EXISTS donors;

-- Create donors table
CREATE TABLE donors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    last_donation DATE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blood_group (blood_group),
    INDEX idx_city (city),
    INDEX idx_verified (verified),
    INDEX idx_last_donation (last_donation)
);

-- Insert sample donor data
INSERT INTO donors (name, blood_group, city, state, age, gender, phone, last_donation, verified) VALUES
    ('Amit Sharma', 'A+', 'Mumbai', 'Maharashtra', 28, 'Male', '9876543210', '2024-01-15', TRUE),
    ('Priya Patel', 'O-', 'Delhi', 'Delhi', 32, 'Female', '9876543211', '2023-12-10', TRUE),
    ('Rajesh Kumar', 'B+', 'Bangalore', 'Karnataka', 35, 'Male', '9876543212', '2024-02-01', TRUE),
    ('Sunita Singh', 'AB+', 'Chennai', 'Tamil Nadu', 29, 'Female', '9876543213', '2023-11-20', FALSE),
    ('Vikram Gupta', 'O+', 'Hyderabad', 'Telangana', 41, 'Male', '9876543214', '2024-01-28', TRUE),
    ('Meera Joshi', 'A-', 'Pune', 'Maharashtra', 26, 'Female', '9876543215', '2024-02-12', TRUE),
    ('Ravi Reddy', 'B-', 'Kochi', 'Kerala', 38, 'Male', '9876543216', '2023-10-15', FALSE),
    ('Kavita Nair', 'AB-', 'Ahmedabad', 'Gujarat', 31, 'Female', '9876543217', '2024-01-05', TRUE),
    ('Arjun Verma', 'O+', 'Jaipur', 'Rajasthan', 27, 'Male', '9876543218', '2024-02-20', TRUE),
    ('Deepika Roy', 'A+', 'Kolkata', 'West Bengal', 33, 'Female', '9876543219', '2023-12-30', FALSE),
    ('Sanjay Mishra', 'B+', 'Lucknow', 'Uttar Pradesh', 45, 'Male', '9876543220', '2024-01-18', TRUE),
    ('Anita Agarwal', 'O-', 'Indore', 'Madhya Pradesh', 24, 'Female', '9876543221', '2024-02-08', TRUE),
    ('Rohit Sinha', 'AB+', 'Patna', 'Bihar', 36, 'Male', '9876543222', '2023-11-25', FALSE),
    ('Pooja Malhotra', 'A-', 'Chandigarh', 'Punjab', 30, 'Female', '9876543223', '2024-02-14', TRUE),
    ('Karthik Iyer', 'B-', 'Coimbatore', 'Tamil Nadu', 39, 'Male', '9876543224', '2024-01-22', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_name ON donors (name);
CREATE INDEX idx_phone ON donors (phone);
CREATE INDEX idx_created_at ON donors (created_at);

-- Display table information
DESCRIBE donors;

-- Show sample of inserted data
SELECT 
    id,
    name,
    blood_group,
    city,
    state,
    age,
    gender,
    phone,
    last_donation,
    verified,
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
FROM donors 
ORDER BY created_at DESC 
LIMIT 10;