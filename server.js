const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const username = 'Bakha'; 
const uri = 'mongodb://localhost:27017'; 
const dbName = 'Final'; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
    secret: '15370933',
    resave: false,
    saveUninitialized: false
  }));

mongoose.connect('mongodb://localhost:27017/Final', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
    });

app.use(express.json());

client.connect(err => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
    
    db = client.db(dbName);
});
process.on('SIGINT', () => {
    client.close().then(() => {
        console.log('MongoDB connection closed');
        process.exit(); 
    }).catch(err => {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1); 
    });
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user }); 
});

app.get('/register', (req, res) => {
    res.render('register', { registrationSuccess: false });
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const db = client.db(dbName);
        const role = req.body.username === 'Bakhtiar' ? 'admin' : 'user';
        await db.collection('users').insertOne({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: parseInt(req.body.age),
            country: req.body.country,
            gender: req.body.gender,
            role: role
        });
        await sendWelcomeEmail(req.body.email);
        res.render('register', { registrationSuccess: true });
    } catch (error) {
        console.error('Error during registration:', error);
        res.send('An error occurred during registration.');
    }
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === 'Bakha' && password === '098765') {
            res.redirect('/admin');
        } else if (username === 'Babubev61' && password === '567890') {
            res.redirect('/user');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login.');
    }
});
app.get('/admin', (req, res) => {
    res.render('admin', { username: req.user ? req.user.username : 'BAdmin' });
});

app.get('/user', (req, res) => {
    res.render('user', { username: req.user ? req.user.username : 'Bakha' });
});

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru", 
    port: 465, 
    secure: true, 
    
    auth: {
      user: 'opi81stri@mail.ru', 
      pass: 'LsuZLfFSPG2mpzzbPhnj' 
    },
    tls:{
      rejectUnauthorized: false
    }
  
  });

async function sendWelcomeEmail(email) {
    return new Promise((resolve, reject) => {
        const mailOptions = {
          from: 'opi81stri@mail.ru', 
          to,
          subject, 
          text 
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
}


app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});