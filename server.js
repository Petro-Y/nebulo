/*
Серверна частина nebula
*/
var http = require('http');
var url = require('url');
var fs = require('fs');
var pg = require('pg');           //postgres
var cheerio = require('cheerio');//jQuery-like server-side library
//var NodeSession = require('node-session');

function placeOnPage($, itemclass, data)
	{
	//$=cheerio.load(template);
	$(itemclass).addClass('blank');
	var item=$.html(itemclass);
	for (i in data)
		{
		var row=data[i];
		for (j in row)
			{
			$(itemclass+'.blank .'+j).text(row[j]||'');
			}
		$(itemclass+'.blank').addClass('done')
		                 .removeClass('blank');
		$(item).insertAfter(itemclass+'.done');
		$(itemclass+'.done').removeClass('done');
		}
	$(itemclass+'.blank').remove();
	//return $.html();
	}
var templates={};	
templates['messages'] = fs.readFileSync('messages.html', 'utf8');;//завантажити з messages.html


http.createServer(function(request, response) 
	{
	var incomplete=1;
	function finish()
		{
		incomplete--;
		if(incomplete<=0)
			{
			//завершувальні дії...
			response.write($.html());
			response.end();
			}
		}
	var pathname = url.parse(request.url).pathname;
	var template=temlates[pathname];
	if(template)
		$=cheerio.load(template);	
	response.writeHead(200, {"Content-Type": "text/html"});
	if(pathname=='exit')//debug option
		{
		response.write('Exiting nebula... <a href="/?">(go top)</a><br>');
		response.end();
		process.exit(0);
		}
	else if(pathname==''){}//головна сторінка: найновіші повідомлення та ін. ......
	else if(pathname=='messages')
		{
		dbrequest="select username, groupname, title, content from messages natural join users natural join groups where commentto is null";
		dbargs=[];		
		showdata(dbrequest, dbargs, $, finish);
		}
	else if(pathname=='login'){}//......
	else if(pathname=='logout'){}//......
	else if(pathname=='register'){}//......
	else if(pathname=='newgroup'){}//......
	else if(pathname=='newmessage'){}//......
	else if(pathname=='mymessages'){}//......
	else if(pathname=='mygroups'){}//......
	else if(pathname=='group'){}//......
	else if(pathname=='thread'){}//message with comments......
	else if(pathname=='user'){}//......
	else if(pathname=='settings'){}//......
	//-------------------------------------------//
	
	
	//show users....
	//show messages:
	function showdata(dbrequest, dbargs, $, finish)
		{
		var client = new pg.Client('postgres://postgres@localhost/nebula');
		//connect to db:	
		client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
		incomplete++;
		client.connect(function (err) 
			{
			if (err){
				console.log('err on connect!!!');
				response.write('<br><hr>err on connect!!!');
				throw err;
				}
				// disconnect the client
			client.query(dbrequest, dbargs,
			//'SELECT $1::text as name', ['brianc'], 
			function (err, result) 
				{
				if (err){
					console.log('err on query!!!');
					response.write('<br><hr>err on query!!!');
					response.end();
					throw err;
					}
				// just print the result to the console
				s='result='+JSON.stringify(result.rows);//[0]);
				console.log(s); // outputs: { name: 'brianc' }
				//response.write(s);
				placeOnPage($, '.message',result.rows);
				client.end(function (err) 
					{
					console.log('client.end');
					if (err){
						console.log('err on end!!!');
						response.end();
						throw err;
						}
					finish();
					//response.end();
					});
				});
			});
		}
	//show groups...
	//response.end();
	finish();
	}).listen(8888);
//========= show some json data ===============	
	/*var cache = [];
	response.write(JSON.stringify([request], function(key, value) {
	if (typeof value === 'object' && value !== null) {
	if (cache.indexOf(value) !== -1) {
	    // Circular reference found, discard key
	    return;
	}
	// Store value in our collection
	cache.push(value);
	}
	return value;
	}).replace( /,/g , ",\n"));*/