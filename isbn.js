var http = require('http'),
    emitter = require('events').EventEmitter,
    inherits = require('sys').inherits;

var options = { host : 'isbn.net.in',
                path : '/' }

function error(code, desc)
{
    this['code'] = code;
    this['desc'] = desc;
}

function Book(data)
{
    // A simple bean to hold the required data
    this.vendor = data[0];
    this.price  = data[1].price;
    this.url    = data[1].url;
}

function Books(books)
{
    // A collection for holding a set of books
    this.books = books;

    /* To enable simple look up add the vendors as attributes to the class
       ex : var b = getBooks();
            // This will print the details of the book set by the vendor
            console.log(b.flipkart);
    */
    for(var i = 0; i < books.length; i++)
        this[books[i].vendor] = books[i];
}

Books.prototype.count    = function() { return this.books.length; }; 
Books.prototype.cheapest = function() {
    // returns the cheapest deal from the set of books
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
    // returns a set of vendors
    var vendors = new Array(this.books.length);

    for(var i = 0; i < vendors.length; i++ )
        vendors[i] = this.books[i].vendor;

    return vendors;
}

function parse(data)
{
    // parses the data which is in json format and creates a list of
    // books
    try
    {
        var json = JSON.parse(data.toString());
        var books = new Array(json.length);
        for(var i = 0; i < json.length; i++)
        {
            books[i] = new Book(json[i]);
        }
        this.emit('success', new Books(books));
    }
    catch(e)
    {
        this.emit('error', e);
    }
}

function lookup(isbn)
{
    // makes an http request to isbn.net.in and triggers 
    // the appropriate events
    var $ = this;
    options.path = '/' + isbn + '.json';
    http.get( options, function(res)
    {
      var data;
      if(res.statusCode != 200)
      {
        if(res.statusCode == 404)
          $.emit('err',
                     new error(res.statusCode, "Invalid isbn : " + isbn));
        else
           $.emit('err',
                    new error(res.statusCode,
                         "Failed fetching the isbn. Http Error"));
        return;
      }
      res.on('data', function(response) {
             if(data == null)
                 data = response;
             else
                 data += response;
     });
      res.on('end', function() { $.__parse(data); });
    }).on('error', function(e) { $.emit('error', new error(-1, e)); });
}

inherits(lookup, emitter);
lookup.prototype.__parse = parse;

function search(isbn)
{
    var cls = new lookup(isbn);
    return cls;
}

var isbn = { lookup : search };

module.exports = isbn;

