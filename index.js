const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
  //connectionString: 'postgres://postgres:root@localhost/rectangles'
}); 

var app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  var getRectanglesQuery = `SELECT * FROM rectangle`;
  pool.query(getRectanglesQuery, (error, result) =>{
    if(error)
      res.end(error);
    var results = {'rows':result.rows}
    console.log(results);
    res.render('pages/rectanglesIndex', results);
   })
});

app.get('/addRectangle', (req, res) => {
    res.render('pages/addRectangle');
})
  
app.post('/addRectangle', (req, res) =>{
  if(!(!req.body.recName || !req.body.recHeight || !req.body.recWidth || !req.body.recColor)){
    let recName = req.body.recName;
    let recHeight = req.body.recHeight;
    let recWidth = req.body.recWidth;
    let recColor = req.body.recColor;

    var addRectangleQuery = `INSERT INTO rectangle values ('${recName}', ${recHeight}, ${recWidth}, '${recColor}');`;
    pool.query(addRectangleQuery, (error,result) =>{
      if(error){res.end(error);}    
      res.redirect('/');
    })
  }  
  else{
    res.send(`<script>alert("Please Fill In All Parameters"); window.location.href = "/addRectangle"; </script>`);
  }
})

app.get('/rectangle/:id', (req,res) =>{
  let rectangleID = req.params.id;
  var getRectanglesQuery = `SELECT * FROM rectangle where id=${rectangleID}`;
  pool.query(getRectanglesQuery, (error, result) =>{
    if(error){res.end(error);}
    var results = {'rows':result.rows}
    console.log(results);
    let recColor = results.rows[0]["color"];
    res.render('pages/rectangleid', results);
  })
})

app.get('/makeChanges/:recID', (req,res) =>{
  let id = req.params.recID;
  var getRectanglesQuery = `SELECT * FROM rectangle where id=${id}`;
  
  pool.query(getRectanglesQuery, (error, result) =>{
    if(error){res.end(error);}
    var results = {'rows':result.rows}
    let recColor = results.rows[0]["color"];
    res.render('pages/makeChanges', results);
  })
})

app.post('/makeChanges/:recID', (req, res) =>{
  if(req.body.recName){
    pool.query(`UPDATE rectangle SET name='${req.body.recName}' WHERE id=${req.params.recID};`);
  }
  if(req.body.recWidth){
    pool.query(`UPDATE rectangle SET width='${req.body.recWidth}' WHERE id=${req.params.recID};`);
  }
  if(req.body.recHeight){
    pool.query(`UPDATE rectangle SET height='${req.body.recHeight}' WHERE id=${req.params.recID};`);
  }
  if(req.body.recColor){
    pool.query(`UPDATE rectangle SET color='${req.body.recColor}' WHERE id=${req.params.recID};`);
  }
  res.redirect('/');
})

app.post('/deleteRectangle/:recID', (req, res) =>{
  pool.query(`DELETE FROM rectangle WHERE id=${req.params.recID}`);
  res.redirect('/');
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));