const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const teamMembers = require('./routes/api/teamMembers');

// Redirecting to routes
app.use('/api/teammembers', teamMembers);

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Connected to user api @${port}.`));