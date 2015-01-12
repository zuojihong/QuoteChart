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

var plotData = {
	labels : ["1","2","3","4","5","6","7", "8", "9", "10"],
	datasets : [
		{
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			//fillColor : "rgba(102,180,88,0.5)",
			//strokeColor : "rgba(102,180,88,1)",
			//pointColor : "rgba(102,180,88,1)",
			pointStrokeColor : "#fff",
			data : [2000,2000,2000,2000,2000,2000,2000, 2000, 2000, 2000]
		}
	]
}

var pointCount = 10;
var chart;
var quoteArr = [];
var quoteCache = [];

$(document).ready(function() {
	var ctx = $("#curveCanvas").get(0).getContext("2d");
	window.setInterval(refreshCurve, 5000);
	chart = new Chart(ctx);
});

function refreshCurve() {
    var dataUpdated = refreshData();
    if (dataUpdated) {
        var options = { animation: false };
		chart.Line(createPlotData(quoteArr), options);
    }
}

function refreshData() {
    var dataUpdated = false;
    if (quoteCache.length > 0) {
        var items = quoteCache.splice(0, 1);
        quoteArr.push(items[0]);
        if (quoteArr.length > pointCount) {
            quoteArr.splice(0, 1);
        }
        dataUpdated = true;
    }

    if (quoteCache.length <= pointCount / 2) {
        fetchData();
    }
    return dataUpdated;
}

function createPlotData(data) {
	var labels = [];
	var dataArr = [];
	
    for (var i=0; i<data.length; i++) {
        var time = new Date();
        time.setTime(data[i].time);
        var timeLabel = time.format("MM-dd hh:mm:ss");
        labels.push(timeLabel);

        dataArr.push(Math.round(data[i].price * 10) / 10);
    }

    plotData.labels = labels;
    plotData.datasets[0].data = dataArr;
	return plotData;
}

function fetchData() {
    var lastItem = getLastDataItem();
    var date = new Date();
    var lastTime = (lastItem == null) ? toUtcTime(date.setHours(10, 0, 0, 0)) : lastItem.time;
    console.log('fetch data after time: ' + lastTime);

    $.get(document.URL + 'quote/sh000001/' + lastTime)
    .success(cacheData)
    .error(function(err) {
        console.error(err);
    });
}

function toUtcTime(time) {
    return time + (-8) * 3600000;
}

function toLocalTime(time) {
    return time + 8 * 3600000;
}

function getLastDataItem() {
    var lastItem = null;
    if (quoteCache.length > 0) {
        lastItem = quoteCache[quoteCache.length - 1];
    }
    else if (quoteArr.length > 0) {
        lastItem = quoteArr[quoteArr.length - 1];
    }
    return lastItem;
}

function cacheData(result) {
    console.log('result: ' + JSON.stringify(result));
	if (result != null && result.status == 0) {
        if (result.data != null && result.data.length > 0)
            quoteCache = quoteCache.concat(result.data);
        else 
            console.info('no data fetched from mongo server');
    }
    else {
		console.error('No valid data. Result status: ' + result.status + '; result data: ' + result.data);
	}
}