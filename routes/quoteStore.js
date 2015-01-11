var mongoose = require('mongoose');

var dbName = 'stock_db';
var addr = process.env.MONGO_PORT_27017_TCP_ADDR || 'silverreef.chinacloudapp.cn';
var uri = 'mongodb://' + addr + ':27017/' + dbName;
console.info('mongodb uri: ' + uri);

mongoose.connect(uri, function(err) {
    console.info('connection status: ' + (err ? err.message : 'ok'));    
});

var db = mongoose.connection;
db.on('error', function(err) {
    console.error('failed to connect to mongo db: ' + err.message);    
});
db.once('open', function() {
    console.info('succeed to connect to mongo db');    
});

var Schema = mongoose.Schema;
var QuoteSchema = new Schema({
    code: String,
    time: Number,
    price: Number    
});

exports.getBatchedQuotesByCode = function(req, res) {
    var model = mongoose.model('Quote', QuoteSchema, 'stocks');
    var code = req.params.code;
    var lastTime = req.params.lasttime;
    console.log('code=' + code + '  lasttime=' + lastTime);
    var query = model.find({ code: code }).where('time').gt(parseInt(lastTime)).limit(10);
    query.exec(function(err, quotes) {
        console.log('items from getBatchedQuotesByCode: ' + (quotes != null) ? quotes.length : 0);
        if (!err) {
            res.send({status: 0, data: quotes});
        } else {
            console.log({status: -1, data: null});
        }
    });
} 