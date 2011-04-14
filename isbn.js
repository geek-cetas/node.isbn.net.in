var http = require('http');

var options = { host : 'isbn.net.in',
                path : '/' }

function error(code, desc)
{
    this['code'] = code;
    this['desc'] = desc;
}

function Book(data)
{
    this.vendor = data[0];
    this.price  = data[1].price;
    this.url    = data[1].url;
}

function Books(books)
{
    this.books = books;
    for(var i = 0; i < books.length; i++)
        this[books[i].vendor] = books[i];
}

Books.prototype.count = function() { return this.books.length; }; 

Books.prototype.cheapest = function() {
    var book;
    for(var i = 0; i < this.books.length; i++)
    {
        if(book == null) book = this.books[i];
        else
        {
            if(book.price > this.books[i].price)
                book = this.books[i];
        }
    }
    return book;
}

Books.prototype.vendors = function() {
    var vendors = new Array(this.books.length);

    for(var i = 0; i < vendors.length; i++ )
        vendors[i] = this.books[i].vendor;

    return vendors;
}

function parse(data, callback)
{
    try
    {
        var json = JSON.parse(data.toString());
        var books = new Array(json.length);
        for(var i = 0; i < json.length; i++)
        {
            books[i] = new Book(json[i]);
        }
        callback(new Books(books));
    }
    catch(e)
    {
        console.log(e);
    }
}

function lookup(isbn, notify)
{
    options.path = '/' + isbn + '.json';
    http.get( options, function(res)
    {
      var data;
      if(res.statusCode != 200)
      {
        if(res.statusCode == 404)
            notify(new error(res.statusCode, "Invalid isbn : " + isbn));
        else
            notify(new error(res.statusCode, "Failed fetching the isbn"));
        return;
      }

      res.on('data', function(response) { if(data == null) data = response;
                                          else data += response; });
      res.on('end', function() { parse(data, notify); });
    }).on('error', function(e) { console.log("ERROR : " + e); });
}

var find = new lookup('014200080', function(response) {
        var books = response;
        console.log(books);
     });
