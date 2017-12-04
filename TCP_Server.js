var net = require("net");
var server = net.createServer();
var request = require("request");
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var phantom = require('phantom');
var iconv = require('iconv-lite');

server.on("connection", function(socket) {
  var remoteAddress = socket.remoteAddress + ":" + socket.remotePort;
  console.log("new client connection is made");

  socket.on("data", function (d) {
    console.log("Data from ", remoteAddress, d);

    var options = {
      uri: 'http://dblp.uni-trier.de/rec/bib/'+d,
      headers: {
          "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
      },
      encoding: 'binary'
    };
    request(options, function (err, response, body) {
          var decode_url = iconv.decode(body, 'utf-8');
          var $ = cheerio.load(decode_url);

          var temp = decode_url.split(/=/);
          var title = decode_url.substring(decode_url.indexOf('title',0)+13, decode_url.indexOf('booktitle',0)-5);
          var paper_url = temp[7].substring(2,temp[7].indexOf('}',0));
          var keyword_list;
          console.log(decode_url);
          console.log("title : " + title);
          console.log("url : " + paper_url);

          phantom.create([], {logLever : 'error'}).then(function(instance) {
            console.log('instance create');
            return instance.createPage().then(function(page) {
              console.log('create page');
              return page.open(paper_url).then(function(status) {
                console.log('status');
                page.evaluate(function() {
                  return document.getElementsByClassName('doc-all-keywords-list-item ng-scope')[0].innerHTML;
                }).then(function(html) {
                  console.log(html);
                });
                });
              });
            });
            socket.write(title);
          });
  });
  socket.once("close", function () {
    console.log("connection closed");
  });
  socket.on("error", function(err) {
    console.log("error");
  });
});

server.listen(9000, function () {
  console.log("server listening to %j", server.address());
});
