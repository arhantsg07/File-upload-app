const multer = require('multer');
const fs = require('fs')
const path = require('path');
// storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const userDir = path.join(__dirname, 'uploads', req.params.username);
      if(!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive : true });
      }  
      
      cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
      cb (null, true)
    } else {
      cb (null, false)
    }
  }

// instance
const upload = multer({ storage: storage });

// const download = (req, res, next) => {
//     console.log('file.controller.download: started')
//     const path = req.body.path
//     const file = fs.createReadStream(path)
//     const filename = (new Date()).toISOString()
//     res.setHeader('Content-Disposition', 'attachment: filename= ' + filename + '')
//     file.pipe(res)
// }

module.exports = upload;
