const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const fs = require('fs');
const File = require('./models/File');
const port = 8000;
const authRoutes = require('./routes/auth');
const flash = require('connect-flash');
const { ensureAuthenticated } = require('./utils/auth');


const upload = require('./multer');


// const uploadDir = 'uploads';

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir);
// }


mongoose.connect('mongodb+srv://<username>:<password>@mycluster.cbtbi45.mongodb.net/?retryWrites=true&w=majority&appName=mycluster', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    // res.locals.user = req.session.user || null;
    next();
});

app.use('/', authRoutes);

app.get('/introduction', ensureAuthenticated, (req, res) => {
    res.render('intro', { user: req.session.user })
})

app.get('/home', ensureAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
})

app.get('/upload', ensureAuthenticated, (req, res) => {
    res.render('upload', { user: req.session.user });
})


// app.post('/upload', upload.single('file'), (req, res) => {
//     res.redirect('/download');
// });


app.post('/upload/:username', ensureAuthenticated, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const { title, description, category } = req.body;
    const file = new File({
        filename: req.file.filename,
        title,
        description,
        category,
        username: req.params.username
    });
    try {
        await file.save();
        res.redirect(`/download/${req.params.username}`);
    } catch (err) {
        console.error('Error saving file metadata:', err);
        res.status(500).send('Error saving file metadata');
    }
});


// app.get('/download', (req, res) => {
//     fs.readdir('uploads', (err, files) => {
//         if (err) {
//             return res.status(500).send('Unable to scan directory');
//         }
//         res.render('download', { files });
//     });
// });

app.get('/download/:username', ensureAuthenticated, async (req, res) => {
    const username = req.params.username;
    try {
        const files = await File.find({ username });
        res.render('download', { files, user: req.session.user });
    } catch (err) {
        console.error('Unable to retrieve files from database:', err);
        res.status(500).send('Unable to retrieve files from database');
    }
});


app.get('/download/:username/:filename', (req, res) => {
    const username = req.params.username;
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, 'uploads', username, filename);


    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist:', err);
            return res.status(404).send('File not found');
        }
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                return res.status(500).send('Error downloading file');
            }
        });
    });
    // res.download(filePath)
});

const uploadDir = path.join(__dirname, 'uploads');
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.get('/create-directory/:username', (req , res) => {
    res.render('redirect');
});

app.post('/create-directory/:username', (req, res) => {
    const userDir = path.join(uploadDir, req.params.username);
    if(!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true});
        res.status(201).send('Directory created');
    } else {
        res.status(400).send('Directory already exists');
    }
});

app.listen(port, () => {
    console.log('Server is running at port 8000');

})