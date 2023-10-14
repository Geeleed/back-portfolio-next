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

app.post('/uploadApi', async (req,res) => {
    if (req.body.admin_password == '7f8cc3dc30ec7d915aef41c1300b65d20b8ec7d393bb128d70117ccece90db0fab44a97e1bbb834314800a2ce8d302f6e6445ae4ed5a332cee7f7ec38c8b4373') {
        await uploadAPI(req.body)
        res.send('upload api สำเร็จ')
    }else{
        res.send('รหัสผ่านไม่ถูกต้อง')
    }
})
app.get('/getApi', async (req, res) => {
    const data = await getApi()
    res.send(data)
})

// เริ่มต้น server ที่พอร์ต ...
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});