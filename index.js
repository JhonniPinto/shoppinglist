const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const sqlite = require('sqlite')
const app = express()

const dbConnection = sqlite.open(path.resolve(__dirname, 'shoppingDb.sqlite'), { Promise })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categories (id INTEGER PRIMARY KEY, category TEXT)')
    await db.run('create table if not exists items (id INTEGER PRIMARY KEY, category INTEGER, item TEXT)')
}
init()

// HOME PAGE
app.get('/', async(req, res) => {
    const db           = await dbConnection
    const categoriesDb = await db.all('select * from categories')
    const items        = await db.all('select * from items')
    const categories   = categoriesDb.map(cat => {
        return {
            ...cat,
            items: items.filter(item => item.category === cat.id)
        }
    })
    res.render('home', {
        categories, slctItem: false
    })
})

// DELETE ITEM
app.get('/items/delete/:id', async(req, res) => {
    const { id } = req.params
    const db = await dbConnection
    await db.run(`delete from items where id = ${id}`)
    res.redirect('/')
})
// ADD ITEM
app.post('/', async(req, res) => {
    const { category, item } = req.body
    const db = await dbConnection
    await db.run(`insert into items(category, item) values('${category}', '${item}')`)
    res.redirect('/')
})
// UPDATE ITEM PATH
app.get('/items/update/:id', async(req, res) => {
    const { id }       = req.params
    const db           = await dbConnection
    const categoriesDb = await db.all('select * from categories')
    const items        = await db.all('select * from items')
    const slctItem     = await db.get(`select * from items where id = ${id}`)
    const categories   = categoriesDb.map(cat => {
        return {
            ...cat,
            items: items.filter(item => item.category === cat.id)
        }
    })
    res.render('home', {
        categories, slctItem
    })
})
// UPDATE ITEM PROCESS
app.post('/items/update/:id', async(req, res) => {
    const { id } = req.params
    const { category, item } = req.body
    const db = await dbConnection
    await db.run(`update items set category='${category}', item='${item}' where id=${id}`)
    res.redirect('/')
})

// CATEGORIES PAGE
app.get('/categories', async(req, res) => {
    const db         = await dbConnection
    const categories = await db.all('select * from categories')
    res.render('categories', {
        categories, category: false
    })
})
// DELETE CATEGORY
app.get('/categories/delete/:id', async(req, res) => {
    const { id } = req.params
    const db     = await dbConnection
    await db.run(`delete from categories where id = ${id}`) 
    res.redirect('/categories')
})
// ADD CATEGORY
app.post('/categories', async(req, res) => {
    const { category } = req.body
    const db = await dbConnection
    db.run(`insert into categories(category) values('${category}')`)
    res.redirect('/categories')
})
// UPDATE CATEGORY PATH
app.get('/categories/update/:id', async(req, res) => {
    const { id } = req.params
    const db = await dbConnection
    const categories = await db.all('select * from categories')
    const category = await db.get(`select * from categories where id = ${id}`)
    res.render('categories', {
        categories, category
    })
})
app.post('/categories/update/:id', async(req, res) => {
    const { id } = req.params
    const { category } = req.body
    const db = await dbConnection
    db.run(`update categories set category = '${category}' where id = ${id}`)
    res.redirect('/categories')
})

app.listen(3000, err => {
    if (err) {
        console.log('Sl server is offline:', err)
    } else {
        console.log('Sl server is online')
    }
})