const express = require('express');
const app = express();
const bodyParser=require('body-parser')
const MongoClient= require('mongodb').MongoClient
const opn=require('opn')
const request=require('request')
const cheerio=require('cheerio')
var fs = require('fs');
const reqT = require("tinyreq")
var og = require('open-graph');
const async=require('async')


app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')

const mongoLink='mongodb://mm:12@ds141082.mlab.com:41082/mongopractice'
var db=

   
MongoClient.connect(mongoLink, (err,database)=>{
  db=database
  if(err) return console.log(err)
  console.log('connected')
  var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
})


var arrayL = []

app.get('/addReview', (req,res)=>{
    db.collection('urls').find().sort({_id:-1}).toArray(function(err, result){
//    console.log(result)
    res.render('reviews.ejs', {urls: result})
})})     

  
app.get('/author/*', (req,res)=>{
  console.log(req.params[0])
  var authorsearch={"$regex": req.params[0], }
//  var authorsearch="AP"  /^Julian/
  let query={}
  query["articleAuthor"]=authorsearch;
  console.log(authorsearch)
//  res.send(req.params[0])
  db.collection('urls').find({ "articleAuthor" : authorsearch }).sort({_id:-1}).toArray(function(err, result){

    res.render('index.ejs', {urls: result})
  })})
  
//transefer headlines into opengl and to frontpage
app.get('/transfer*', (req,res)=>{
  db.collection('articles').find().toArray(function(err,results){
    if(err){throw err}
//    console.log(results.length)
//    console.log(results[0]['headline'])
    for(let x in results){
//      console.log(x)
//      console.log(results[x]['headline'])
     var url = "https://www.cnbc.com/2017/08/16/"+results[x]["headline"].split(" ").join('-')+".html"
     console.log(url) 
    
     og(url, function(err, meta){
     console.log(meta);})
    }
  // //   db.collection('newsSites').save(meta,(err,results)=>{
  // //   if(err) return console.log(err)
  // // })
  //   })
    res.send(results)
  })
})


app.get('/', (req, res)=> {
//  console.log(__dirname)
  db.collection('urls').find().sort({_id:-1}).toArray(function(err, result){
//    console.log(result)
    res.render('index.ejs', {urls: result})
  })})




app.post('/url', (req, res) => {
  db.collection('urls').save(req.body, (err,results)=>{
    if(err) return console.log(err)
  })
  console.log(req.body)
  res.redirect('/')
})

app.post('/newsSite', (req, res)=>{

// opengraph info
  
  var url = req.body.urlName;
  console.log(url)
    og(url, function(err, meta){
    console.log(meta);
        db.collection('newsSites').save(meta,(err,results)=>{
    if(err) return console.log(err)
  })})
  
request(url, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
        let hh={};
        let findSame={};    
    let resultt = $('div.headline').text()
//    console.log(resultt)
    let resu=resultt.split(/\n/)
    for (let x in resu){
      let short=resu[x].substring(12)
      hh={ headline: short};
      var query = {};
      var h="headline"
      query[h] = short;
//      hh={headline:"Consumers are shopping, showing economy may be stronger than expected"}
      hh={headline:short}
      if (resu[x].length<34){}
      else{         
        db.collection('articles').findOne(hh,(function(err,document){
          if(err){throw err}
          console.log(short)
//          console.log(hh+"  kjhkjh//")
          console.log(document)
          console.log("doc")
          if(document==null){
         db.collection('articles').save({'headline':resu[x].substring(12)}, (err,results)=>{
    if(err) return console.log(err)          
        })}
        }                      
))}

      
  
      }}})
  
               

    
  db.collection('articles').find().sort({_id:-1}).toArray(function(err, result){
   res.render('reviews.ejs',{articles:result}) 
  })
    
})
  

  



