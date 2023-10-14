require('dotenv').config()
const { PORT, URIMONGODB, LINE_MACTOKEN } = process.env
const lineNotify = require('line-notify-nodejs')(LINE_MACTOKEN)

const mongodb = require('mongodb').MongoClient
// const database = async (database_name,collection_name) =>{
//     const db = await mongodb.connect(URIMONGODB)
//     const DB = db.db(database_name).collection(collection_name)
//     return DB
// }

const postComment = async (objectData) => {
    const db = await mongodb.connect(URIMONGODB)
    await db.db('webboard').collection('comment').insertOne(objectData)
    await db.close()
}
const getComment = async () => {
    const db = await mongodb.connect(URIMONGODB)
    const data = await db.db('webboard').collection('comment').find({}).toArray()
    await db.close()
    return data
}

const uploadAPI = async (jsonData) => {
    const db = await mongodb.connect(URIMONGODB)
    await db.db('portfolio').collection('myApi').insertOne(jsonData)
    await db.close()
}
const getApi = async () => {
    const db = await mongodb.connect(URIMONGODB)
    const data = await db.db('portfolio').collection('myApi').find({}).toArray()
    await db.close()
    return data
}
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');

app.use(cors())
// กำหนดให้ Express ใช้ body-parser เพื่อแปลงข้อมูลที่ส่งมาจากฟอร์มเป็น JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/test-get', (req, res) => {
    res.send("Hello World!")
})

app.get('/comment', async (req, res) => {
    const data = await getComment()
    res.send(data)
})

app.post('/comment', async (req) => {
    await postComment(req.body)
})

app.post('/line-msg', async (req) => {
    const data = req.body
    const msg = `
    ส่งจาก Contact ของ portfolio-next
    เวลา:${new Date()}
    หัวข้อ:${data.title}
    ข้อความ:${data.text}`
    await lineNotify.notify({ message: msg })
})

app.post('/uploadApi', async (req, res) => {
    fetch('https://math-hub-gamma.vercel.app/sha512/' + req.body.admin_password).then(res => res.json())
        .then(data => {
            delete req.body['admin_password']
            if (data.hash_hex == 'd698497891ef4dfe9ef3d812a6e95492a97dceef39023c2c420d2430ab43aafe4855827f746fde0ac87260e94870a40ce4059eead1389ed97344e57f9c401414') {
                uploadAPI(req.body)
            }
            res.redirect('back')
        })
})
app.get('/getApi', async (req, res) => {
    const data = await getApi()
    res.send(data)
})


let records = []
app.post('/post-the-data', (req, res) => {
    data = req.body;
    records.push(data)
    res.redirect('back')
})
app.get('/get-the-data', (req, res) => {
    res.send(records)
})
app.get('/clear-the-data', (req, res) => {
    records = [];
    // res.end()
    res.redirect('back')
})

// เริ่มต้น server ที่พอร์ต ...
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});