const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-bulk', async (req, res) => {
  const { subject, content, recipients, emailUser, emailPass } = req.body;

  if (!subject || !content || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (!emailUser || !emailPass) {
    return res.status(400).json({ error: 'Email credentials are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const htmlContent = content
    .split('\n')
    .map(line => line.trim())
    .join('<br>');

  try {
    const promises = recipients.map((to) =>
      transporter.sendMail({
        from: emailUser,
        to,
        subject,
        text: content,
        html: htmlContent,
      })
    );

    await Promise.all(promises);
    res.json({
      success: true,
      message: `Sent to ${recipients.length} recipients`,
    });
  } catch (error) {
    console.error('Nodemailer error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Bulk Email Sender backend is running');
});

app.listen(5000, () => console.log('Server on port 5000'));
