var express = require('express');
var app = express();
let client = require("mongodb").MongoClient


let rels
client.connect('mongodb://127.0.0.1:27017/test', function(e,db){
	console.log("Db: ", e)

	db.collection("rels", async function(e, r){

		rels = r
	});

});


// http://127.0.0.1?search="hello"+"world"
// example query 
// http://127.0.0.1:3000/%22insurance%22+%22agent%22
app.set('view engine', 'ejs')
app.get("/:search", function(req, res){
	let search = req.params.search;
	rels.find({
		"$text": {
				"$search": search
		}
	}).toArray(function(err, items) {
		console.log(err, items)
    	res.json(JSON.stringify(items));
  	})

})

app.get("/html/:search", function(req, res){
	let search = req.params.search;
	rels.find({
		"$text": {
				"$search": search
		}
	}).toArray(function(err, items) {
		// console.log(err, items)
    	res.render("main", {usefull: items} );
  	})

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
