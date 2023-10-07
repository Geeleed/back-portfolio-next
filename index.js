require('dotenv').config()
const { PORT, URIMONGODB, LINE_MACTOKEN } = process.env
const lineNotify = require('line-notify-nodejs')(LINE_MACTOKEN)

const mongodb = require('mongodb').MongoClient

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

const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');

app.use(cors())
// กำหนดให้ Express ใช้ body-parser เพื่อแปลงข้อมูลที่ส่งมาจากฟอร์มเป็น JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/comment', async (req, res) => {
    const data = await getComment()
    res.send(data)
})

app.post('/comment', async (req) => {
    await postComment(req.body)
})

app.post('/line-msg', (req) => {
    const data = req.body
    const msg = `
    ส่งจาก Contact ของ portfolio-next
    เวลา:${new Date()}
    หัวข้อ:${data.title}
    ข้อความ:${data.text}`
    lineNotify.notify({ message: msg })
})

// เริ่มต้น server ที่พอร์ต ...
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});