var http = require('http');

Date.prototype.format = function(fmt)   
{ //Date.format by author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                    
    "d+" : this.getDate(),                       
    "h+" : this.getHours(),                      
    "m+" : this.getMinutes(),                    
    "s+" : this.getSeconds(),                   
    "q+" : Math.floor((this.getMonth()+3)/3), //??   
    "S"  : this.getMilliseconds()                
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 

var buffer = '';

var options = {
    host : 'hq.sinajs.cn',
    port : 80,
    path : '',
    method : 'GET'
};

exports.getLatestQuoteByCode = function(req, res) {
    var code = req.params.code;
    console.log('code=' + code);
    options.path = '/list=' + code;

    var quoteReq = http.get(options, function(quoteRes) {
        console.log('res statusCode: ' + quoteRes.statusCode);
        var quoteData = null;
        quoteRes.on('data', function(chunk) { 
            buffer += chunk.toString(); 
        });
        quoteRes.on('end', function() { 
            quoteData = extractData(); 
            buffer = '';
            if (quoteData != null) {
                res.send( {status: 0, data: quoteData} );
            } else {
                res.send( {status: -1, data: null} );
            }
        });
        
    });
    quoteReq.on('error', function(err) {
        console.error('request to fetch data failed' + err.message);
    });
    quoteReq.end();
}

function extractData() {
    console.log('extractData: ' + buffer);
	var quoteStr = buffer.substring(buffer.indexOf('\"') + 1, buffer.lastIndexOf('\"'));
	var paramArr = quoteStr.split(',');
	var curPrice = paramArr[3];
	var dateArr = paramArr[30].split('-');
	var timeArr = paramArr[31].split(':');
	var date = new Date(parseInt(dateArr[0]), parseInt(dateArr[1])-1, parseInt(dateArr[2]), 
		parseInt(timeArr[0]), parseInt(timeArr[1]), parseInt(timeArr[2]));
	console.log('price=' + curPrice + ', date=' + date.format("MM-dd hh:mm:ss"));
	return {code: 'sh000001', price: curPrice, time: date.format("MM-dd hh:mm:ss")};
}