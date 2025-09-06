DROP TABLE IF EXISTS donors;

CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    last_donation DATE DEFAULT NULL,
    weight INT NOT NULL,
    medical_conditions VARCHAR(255) DEFAULT NULL,
    emergency_contact VARCHAR(15) NOT NULL,
    additional_notes TEXT,
    verified TINYINT(1) DEFAULT 0
);

-- Insert some sample donors
INSERT INTO donors 
(name, blood_group, age, gender, phone, city, state, last_donation, weight, medical_conditions, emergency_contact, additional_notes, verified)
VALUES
('Alice Johnson', 'A+', 28, 'Female', '9876543210', 'Vellore', 'Tamil Nadu', '2024-01-15', 55, 'None', '9123456789', 'Regular donor', 0),
('Bob Smith', 'B-', 35, 'Male', '9123456780', 'Chennai', 'Tamil Nadu', '2023-12-20', 70, 'Diabetes', '9988776655', 'Available only weekends', 0),
('Carol Lee', 'O+', 30, 'Female', '9988776655', 'Coimbatore', 'Tamil Nadu', '2024-06-05', 60, 'None', '9876501234', '', 0);
