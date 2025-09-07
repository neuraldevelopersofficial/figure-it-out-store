const express = require('express');
const https = require('https');
const router = express.Router();

router.get('/:pincode', async (req, res) => {
  const { pincode } = req.params;

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'A valid 6-digit pincode is required' });
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const url = `https://api.postalpincode.in/pincode/${pincode}`;
      https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });

    if (data && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      res.json({
        success: true,
        city: postOffice.District,
        state: postOffice.State,
        country: postOffice.Country
      });
    } else {
      res.status(404).json({ error: 'Pincode not found' });
    }
  } catch (error) {
    console.error('Pincode API error:', error);
    res.status(500).json({ error: 'Failed to fetch pincode data' });
  }
});

module.exports = router;
