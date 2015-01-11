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

$(document).ready(function() {
	var ctx = $("#curveCanvas").get(0).getContext("2d");
	window.setInterval(fetchData, 5000);
	chart = new Chart(ctx);
});


function fetchData(url) {
	console.log('url: ' + document.URL);
	$.get(document.URL + 'quote/sh000001')
	.success(refreshData)
	.error(handleError);
}

function refreshData(result) {
    console.log('result: ' + JSON.stringify(result));
	if (result != null && result.status == 0) {
        appendData(result.data)
		var options = { animation: false };
		chart.Line(createData(quoteArr), options);
	}
	else {
		console.log('No valid data. Result status: ' + result.status + '; result data: ' + result.data);
	}
}

function appendData(item) {
    if (quoteArr.length > 0) {
        //remove redundant data items which have the same time
        var lastItem = quoteArr[quoteArr.length - 1];
        if (lastItem.time != item.time) {
            quoteArr.push(item);
            if (quoteArr.length > pointCount) {
                quoteArr.splice(0, 1);
            }
        }
    }
    else {
        quoteArr.push(item);
    }
}

function handleError(err) {
	console.error(err);
}


function createData(data) {
	var labels = [];
	var dataArr = [];
	
    for (var i=0; i<data.length; i++) {
        var timeLabel = data[i].time;
        labels.push(timeLabel);

        dataArr.push(Math.round(data[i].price * 10) / 10);
    }

    plotData.labels = labels;
    plotData.datasets[0].data = dataArr;
	return plotData;
}
