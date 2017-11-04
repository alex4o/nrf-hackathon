var request = require('async-request')
  , cheerio = require('cheerio');
let client = require("mongodb").MongoClient
const url = require('url');
let sleep = require('sleep-promise');
// var Curl = require( 'node-libcurl' ).Curl;

client.connect('mongodb://127.0.0.1:27017/test', function(e,db){
	console.log("Db: ", e)



	let root = "https://195.99.1.39/handbook"
	let root1 = "https://www.handbook.fca.org.uk/handbook"

	let tree = {}
	let links = []
	db.collection("rels", async function(e, rels){
		console.log("Collection: ", e)
		function deeper(el /* ul */){

			el.each(async function(i){
				let a = $(this).children("a")

				// console.log($(this).children("ul"))
				let href = url.resolve(root1, a.attr("href"))

				if(href.endsWith(".html") && href.includes("PERG")){
					links.push({ 
						href: href,
						title: a.attr("title"), 
						text: a.text() 
					})


					//Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36
					// var curl = new Curl();

					// curl.setOpt( 'URL', href );
					// curl.setOpt( 'FOLLOWLOCATION', true );
 

					// curl.on("end", function(statusCode, body, headers){
					try{
						await sleep(5000);
						let {body, statusCode, headers} = await request(href, { "headers":
							 {"Host": "www.handbook.fca.org.uk", "User-Agent": "curl/7.56.1","Accept": "*/*"}
						})
						
						console.log("index:", i, href, statusCode)
						
						// console.log(statusCode, body)
						// this.close()

						$ = cheerio.load(body)
						let title

						let sec = $("section")
						console.log(sec.length)
						sec.each(function() {
							self = $(this) 

							// console.log("working")
							console.log(self.children("header").text())
							if(self.children("header").text() != ""){
								console.log("contains")
								title = self.children("header").text()
								return
							}

							let details = self.find(".details").html()
							let section = self.find("p").text()
							console.log("Inserting: ", title)
							rels.insertOne({ 
								tags: self.find(".autodeftext").text(),
								title: $("h1").html(),
								details: details,
								section: section,
								section_title: title,
								additional: [a.attr("title"), href, a.text()] 
							}, function(err, result){
								// console.log(err, result)
							})	

							title = ""

							// console.log(self.find(".autodeftext"))
						})
					}catch(err){
						console.log(err)
					}
					// })

					// curl.on( 'error', curl.close.bind( curl ) );
					// curl.perform();
				}

				deeper($(this).children("ul").children())
			})
		}

		// Chup2uhu
		try{
			let {body, err, resp} = await request(root1)
			console.log("error: ", err)
			$ = cheerio.load(body)

			deeper($(".publications-nav > li"))


			console.log(links, tree)
		}catch(err){
			console.log(err)
		}

	})


	

})