const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all donors with optional filtering
router.get('/', async (req, res) => {
    try {
        const { bloodGroup, city } = req.query;
        let query = 'SELECT * FROM donors WHERE 1=1';
        const params = [];

        if (bloodGroup) {
            query += ' AND blood_group = ?';
            params.push(bloodGroup);
        }

        if (city) {
            query += ' AND LOWER(city) LIKE LOWER(?)';
            params.push(`%${city}%`);
        }

        query += ' ORDER BY name ASC';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors'
        });
    }
});

// Get donor statistics
router.get('/stats', async (req, res) => {
    try {
        const [donorCount] = await db.execute('SELECT COUNT(*) as count FROM donors');
        const [verifiedCount] = await db.execute('SELECT COUNT(*) as count FROM donors WHERE verified = 1');
        
        const activeDonors = donorCount[0].count;
        const verifiedDonors = verifiedCount[0].count;
        const successRate = activeDonors > 0 ? ((verifiedDonors / activeDonors) * 100).toFixed(1) : 0;
        
        // Calculate estimated lives saved (assuming each donor saves ~1.4 lives on average)
        const livesSaved = Math.floor(activeDonors * 1.4);
        
        // Simulate emergency status (in real app, this would come from emergency requests table)
        const emergencyStatus = Math.floor(Math.random() * 5) + 1;

        res.json({
            livesSaved,
            activeDonors,
            successRate: parseFloat(successRate),
            emergencyStatus
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
    try {
        // In a real application, you would have an activities table
        // For now, we'll generate some sample activity based on recent registrations
        const [recentDonors] = await db.execute(`
            SELECT name, city, created_at 
            FROM donors 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        const activities = recentDonors.map(donor => ({
            description: `New donor ${donor.name} registered in ${donor.city}`,
            timestamp: donor.created_at || new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        }));

        res.json(activities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.json([]); // Return empty array on error
    }
});

// Register new donor
router.post('/', async (req, res) => {
    try {
        const { name, bloodGroup, age, gender, phone, city, state, lastDonation } = req.body;

        // Validation
        if (!name || !bloodGroup || !age || !gender || !phone || !city || !state) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (age < 18 || age > 65) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 18 and 65'
            });
        }

        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(bloodGroup)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blood group'
            });
        }

        // Check if phone number already exists
        const [existingDonor] = await db.execute(
            'SELECT id FROM donors WHERE phone = ?',
            [phone]
        );

        if (existingDonor.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A donor with this phone number already exists'
            });
        }

        // Insert new donor
        const query = `
            INSERT INTO donors (name, blood_group, age, gender, phone, city, state, last_donation, verified, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const verified = Math.random() > 0.3 ? 1 : 0; // 70% chance of being verified
        
        const [result] = await db.execute(query, [
            name, bloodGroup, age, gender, phone, city, state, lastDonation, verified
        ]);

        res.status(201).json({
            success: true,
            message: 'Donor registered successfully',
            donorId: result.insertId
        });

    } catch (error) {
        console.error('Error registering donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register donor'
        });
    }
});

// Delete donor
router.delete('/:id', async (req, res) => {
    try {
        const donorId = req.params.id;

        if (!donorId || isNaN(donorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid donor ID'
            });
        }

        // Check if donor exists
        const [existingDonor] = await db.execute(
            'SELECT id FROM donors WHERE id = ?',
            [donorId]
        );

        if (existingDonor.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        // Delete donor
        await db.execute('DELETE FROM donors WHERE id = ?', [donorId]);

        res.json({
            success: true,
            message: 'Donor deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete donor'
        });
    }
});

// Get donor by ID
router.get('/:id', async (req, res) => {
    try {
        const donorId = req.params.id;

        if (!donorId || isNaN(donorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid donor ID'
            });
        }

        const [rows] = await db.execute(
            'SELECT * FROM donors WHERE id = ?',
            [donorId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donor'
        });
    }
});

module.exports = router;