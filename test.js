var isbn = require('./isbn');

isbn.lookup('0142000280').on('error',
    function(err) { 
        console.log("ERROR :", err);
     }).on('success',
     function(books) {
         console.log("BOOKS :", books.count());
     });
