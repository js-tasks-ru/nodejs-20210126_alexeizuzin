const url = require('url');
const http = require('http');
const fs = require('fs');
const path = require('path');
const LimitSizeStream = require('./LimitSizeStream');
const { pipeline, finished } = require('stream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.length === 0) {
        res.statusCode = 500;
        res.end('500');
        break;
      }

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('400');
        break;
      }

      try {
        const writeStream = fs.createWriteStream(filepath, {
          flags: 'wx',
        });
        const limit = new LimitSizeStream({ limit: 1048576 });

        req.pipe(limit).pipe(writeStream);

        limit.on('error', function (err) {
          // console.log(' << 5 l e', err.code);
          if (err.code === 'LIMIT_EXCEEDED') {
            
            fs.unlink(filepath, () => {});
            res.statusCode = 413;
            res.end('413');
            //throw Error ('LIMIT_EXCEEDED');
          }
        });
      
        writeStream.on('error', function (err) {
          // console.log(' << 1', res.statusCode, err.code);
          if (err.code === 'EEXIST') {
            res.statusCode = 409;
            res.end('409');
          } else {
            console.log(' << 501 2');
            fs.unlink(filepath, () => {});
            res.statusCode = 501;
            res.end('501');
          };
        });

        writeStream.on('finish', function () {
          // console.log(' << 2', res.statusCode);
          res.statusCode = 201;
          res.end('201');
        });

        req.on('aborted', function () {
          fs.unlink(filepath, () => {});
        });


      } catch (e) {
        console.log(' << 3', e.code);
        if (e.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('404');
        }
      }

      break;

    default:
      // console.log(' << 501 1');
      // fs.unlink(filepath, () => {});
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
