//Channel slugs for data
var windSpeedSlug = 'hqlu58rd';
var windDirSlug= 'p8up4smy';
var temperatureSlug = 'xzhp3mtf';
var humSlug = '78q9uj8x';
var pressSlug='zzydnckt';
var rainSlug='bnplzh72';

var dataInterval = "15min";

//Data interval is hardcoded in this example
var    end = new Date();
var    start = new Date(end.getTime() - 10*24*60*60*1000);
var    startTime="2013-01-11T12:11:11.000Z"
var    startTime=start.toISOString(); //"2013-03-29T12:11:11.000Z"
var    endTime=end.toISOString(); //"2013-05-14T15:27:22.000Z"

var windDirData = null;
var windSpeedData = null;
var windCatData = null;
var tempData = null;
var humData = null;

//Speed categories in m/s
var speedCategories = [0, 0.3, 1.5, 3.4, 5.4, 11, 17, 21];
var windSpeedColors = [ '#ffffff', '#a0a0a0', '#606060', '#303060', '#000080', '#400080', '#800040', '#a00000','#ff0000' ];

function isMobile() {
    try {
        var isMobile_Agents = ["Windows CE", "Windows Phone"];
        for(var i = 0; i < isMobile_Agents.length; i++) {
            if (navigator.userAgent.toLowerCase().indexOf(isMobile_Agents[i].toLowerCase()) > 0) return true;
        }
        return false;
    } catch(e){ console.log("Error in isMobile"); return false; }
}

function alignWindData() {
    var iDir = 0;
    var iSpeed = 0;
    var dirDataPoints = windDirData.toArray();
    var speedDataPoints = windSpeedData.toArray();
    var nDir=dirDataPoints.length;
    var nSpeed=speedDataPoints.length;
    var wdir;
    var wspeed;
    var wind = [];

    var done = false;

    var maxTimeDifference=20;

    while(!done) {

	wspeed=speedDataPoints[iSpeed];

	wdir=dirDataPoints[iDir];

	tspeed = wspeed[0];
	tdir = wdir[0];

	while ((tspeed-tdir) > 1000) {
	    iDir++;
	    if(iDir>=nDir) {
		done=true;
		break;
	    }
	    wdir=dirDataPoints[iDir];
	    tdir = wdir[0];
	} 

	
	wind.push([wdir[0].getTime(), wdir[1], wspeed[1]])

	iSpeed++;

	if(iSpeed>=nSpeed) {
	    done=true;
	    break;
	}
    }

    return wind;
    
}

function categorizeWindData(w) {
    var i, t, d, s;

    var data = [];
    
    //Speed categories, start always from 0
    // 0-1, 2-4, 4-8, 8-16, 16+
    speedCats = speedCategories.length+1;

    //Initialize data table
    for(s=0;s<speedCats;s++) {
	data[s] = [];
	for (d=0;d<8;d++) {
	    data[s][d] = 0;
	}
    }

    //Create time/speed/direction histogram data
    for(i=0;i<w.length;i++) {
	//for(i=0;i<1000;i++) {
	t=w[i][0];
	d=w[i][1];
	s=w[i][2];

	// Categorize direction to 45deg bins 0-7 = N-NE-E-SE-S-SW-W-NW. 
	// The N bin is from 360-45/2=337.5deg to 45/2=22.5deg
	var dirI = Math.floor(((d+22.5)%360)/45);
	var j;
	// Categorize speed
	for (j=0;j<speedCats-1;j++) {
	    if(s<=speedCategories[j+1]) {
		break;
	    }
	}
	var speedI = j;
	if(speedI>=speedCats) {
	    speedI=speedCats-1;
	}
				      

	data[speedI][dirI] = data[speedI][dirI]+1;
    }

    //debug dump of data
    if(false) {
	for(i=0;i<data.length;i++) {
	    var row = data[i];
	    for(j=0;j<row.length;j++) {
//		console.log("dir="+j+", speed=" + i + ", count=" + data[i][j]);
	    }
	}
    }

    return data;
}

function plotTempHum() {
    //    addTemperatureData(tempData);
    //    addHumData(humData);
    if (!tempData || !humData) return;
    var tempPoints=[];
    var humPoints = [];
    for(var i=0;i<tempData.length;i++) {
	tempPoints.push([tempData[i][0].getTime(), tempData[i][1]]);
    }
    for(var i=0;i<humData.length;i++) {
	humPoints.push([humData[i][0].getTime(), humData[i][1]]);
    }
    //console.log(humData);
    
    
    $('#temphumcontainer').highcharts('StockChart', {
	    chart: {
                zoomType: 'x',
		    spacingRight: 20
		    },
		
		navigator : {
            enabled: !isMobile()
        },
        
        chart: {
            spacingLeft: 20,
            spacingRight: 3
        },
        
        scrollbar: {
            enabled: !isMobile() 
        },
        
        legend: {
            enabled: true,
            layout: 'horizontal',
            borderWidth: 0
        },
        
        rangeSelector : {
            selected : 5,
            buttons: [ {
                type: 'all',
                text: 'All'
            }, {
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'hour',
                count: 6,
                text: '6h'
            }, {
                type: 'hour',
                count: 12,
                text: '12h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            } ],
            inputEnabled: false
        },
        
        colors: ["#C00000", "#3366FF"],
		
        exporting: {
            enabled: !isMobile()
        },
        
		title : {
            text : 'Temperature and Humidity'
        },
        
        xAxis: {
            startOnTick: false,
            minPadding: 0.01
        },
		
		yAxis: [ 
            {
                labels: {
                    formatter: function() {
                        return this.value +'°C';
                    }
                }
            },
			{
				labels: {
                    formatter: function() {
                        return this.value +' %';
                    },
				    max: 100,
				    min: 0,
				    'auto-scale': false,
				    minrange:100,
			    },
			    opposite: true 
            }
        ],
        
		series : [{
		    marker: {
			enabled: false
			    },
			name : 'Temperature',
			data : tempPoints,
			yAxis: 0,
			tooltip: {
			valueDecimals: 1,
			    valueSuffix: ' °C'
			    }
		},{
		    marker: {
                enabled: false
            },
            name : 'Humidity',
            data : humPoints,
                yAxis: 1,
                tooltip: {
                valueSuffix: " %RH",
                valueDecimals: 1
            }
		}],
        
		xAxis: 
	    {
		'title': 'Date',
		    events : {
		    afterSetExtremes : afterSetExtremes
			},
		    
		    
		    type: 'datetime',
		    dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
			year: '%b'
			}
	    },
		}
	);

}

function addTempHumData(temp, hum) {
    if(temp!=null) {
	tempData = temp.toArray();
	if(humData!=null) {
	    plotTempHum();
	}
    }
    if(hum!=null) {
	humData=hum.toArray();
	if(tempData!=null) {
	    plotTempHum();
	}
    }

}    

function addWindData(speed, dir) {
    if(speed!=null) {
	windSpeedData = speed;
	if(windDirData != null) { 
	    plotWind();
	}
    }
    if(dir!=null) {
	windDirData=dir;
	if(windSpeedData != null) {
	    plotWind();
	}
    }
}

function init() {
    windSpeedSlug = 'hqlu58rd';
    windDirSlug= 'p8up4smy';
    temperatureSlug = 'xzhp3mtf';
    humSlug = '78q9uj8x';
    pressSlug='zzydnckt';
    rainSlug='bnplzh72';

    //startTime="2013-01-11T12:11:11.000Z"
    //startTime="2013-03-29T12:11:11.000Z"
    //endTime="2013-05-14T15:27:22.000Z"
    var    end = new Date();
    var    start = new Date(end.getTime() - 10*24*60*60*1000);
    var    startTime=start.toISOString(); //"2013-03-29T12:11:11.000Z"
    var    endTime=end.toISOString(); //"2013-05-14T15:27:22.000Z"

    ibisense.setApiKey("635137e5a8bec2eecf06de10df28f6890e4d35194a1b9e59beb728997aad1c26");
    //Get wind direction+speed
    updateWindData(startTime, endTime);

    //Get temperature
    ibisense.datapoints.get({cuid: temperatureSlug, 
		start: startTime,
		end: endTime,
	    func: "avg",
	    interval: dataInterval,
                tz: "Europe/Helsinki"}, 
        function(dataset, status) {
            addTempHumData(dataset,null);
        }
    );
    
    //Get hum, 78q9uj8x

    ibisense.datapoints.get({cuid: humSlug, 
		start: startTime,
		end: endTime,
	    func: "avg",
	    interval: dataInterval, tz: "Europe/Helsinki"}, 
        function(dataset, status) {
            addTempHumData(null,dataset);
        }
    );

    //Get rain, bnplzh72
    //Get barometric pressure, zzydnckt

}

function updateWindData(startT, endT) {
    windSpeedData = null;
    windDirData = null;

    //Get wind direction+speed
    ibisense.datapoints.get({cuid: windSpeedSlug, 
		start: startT,
		end: endT,
	    func: "avg",
	    interval: dataInterval, tz: "Europe/Helsinki"}, 
    function(dataset, status) {
	addWindData(dataset, null);
    }, null, null);

    ibisense.datapoints.get({cuid: windDirSlug, 
		start: startT,
		end: endT,
	    func: "avg",
	    interval: dataInterval, tz: "Europe/Helsinki"}, 
    function(dataset, status) {
	addWindData(null, dataset);
    }, null, null);

    
}

var lastExtremeTimestamp = null;

function _updater(nowtime, start, end) {
    return function() {
	if(lastExtremeTimestamp == nowtime) {
	    updateWindData(startTime.toISOString(), endTime.toISOString());
	}
    }
}
function afterSetExtremes(e) {

    //    var url,
    //currentExtremes = this.getExtremes(),
    //range = e.max - e.min;

    lastExtremeTimestamp = Date.now();

    //console.log("min=" + e.min + ", max=" + e.max);
    startTime=new Date(e.min);
    endTime=new Date(e.max);
    //console.log(startTime.toISOString());

    setTimeout(_updater(Date.now(), startTime, endTime), 1000);

    

}

function addTemperatureData(data) {
    datapoints = data.toArray();

    plotData = [];
    var v;
    for(var i=0;i<datapoints.length;i++) {
	v=datapoints[i].getValue();
	plotData.push([datapoints[i].timestampMs(),v]);
    }

    //console.log(plotData);
    $('#tempcontainer').highcharts('StockChart', {
	    chart: {
                zoomType: 'x',
		    spacingRight: 20
        },
        
        navigator : {
            enabled: !isMobile()
        },
        scrollbar: {
            enabled: !isMobile() 
        },
        
        exporting: {
            enabled: !isMobile()
        },
        
        chart: {
            spacingLeft: 20,
            spacingRight: 3
        },
        
        rangeSelector : {
            selected : 5,
            buttons: [ {
                type: 'all',
                text: 'All'
            }, {
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'hour',
                count: 6,
                text: '6h'
            }, {
                type: 'hour',
                count: 12,
                text: '12h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            } ],
            inputEnabled: false
        },
        
        colors: ["#C00000", "#3366FF"],
		
		title : {
		text : 'Temperature'
		    },
		
		series : [{
			marker: {
                        enabled: false
			    },
		    name : 'Artjarvi',
			data : plotData,
			tooltip: {
			valueDecimals: 1
			    }
		}],
		legend: {
		enabled: false,
		    },
		xAxis: {
		events : {
		    afterSetExtremes : afterSetExtremes
			},

                type: 'datetime',
		    dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
			year: '%b'
			}
            },
		yAxis: {
                title: {
                    text: 'Temperature'
			},
		    //min: 0
		    },
		
		plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
			    stops: [
				    [0, Highcharts.getOptions().colors[0]],
				    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
			    },
			lineWidth: 1,
			marker: {
                        enabled: false
			    },
			shadow: false,
			states: {
                        hover: {
                            lineWidth: 1
				}
                    },
			threshold: null
			}
            },
		}
	);


}


function addHumData(data) {
    datapoints = data.toArray();

    plotData = [];
    var v;
    for(var i=0;i<datapoints.length;i++) {
	v=datapoints[i].getValue();
	plotData.push([datapoints[i].timestampMs(),v ]);
    }

    //console.log(plotData);
    $('#humcontainer').highcharts('StockChart', {
	    chart: {
                zoomType: 'x',
		    spacingRight: 20
		    },
		
        navigator : {
            enabled: enable_nav
        },
        
        scrollbar: {
            enabled: enable_nav 
        },
        
        rangeSelector : {
            selected : 5,
            buttons: [ {
                type: 'all',
                text: 'All'
            }, {
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'hour',
                count: 6,
                text: '6h'
            }, {
                type: 'hour',
                count: 12,
                text: '12h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            } ],
            inputEnabled: false
        },
		
		title : {
                text : 'Humidity'
        },
        
        colors: ["#C00000", "#3366FF"],
		
		series : [{
			marker: {
                        enabled: false
			    },
		    name : 'Artjarvi',
			data : plotData,
			tooltip: {
			valueDecimals: 1
			    }
		}],
		xAxis: {
		events : {
		    //		    afterSetExtremes : afterSetExtremes
			},

                type: 'datetime',
		    dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
			year: '%b'
			}
            },
		yAxis: {
                title: {
                    text: 'Humidity'
			},
		    //min: 0
		    },
		
		plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
			    stops: [
				    [0, Highcharts.getOptions().colors[0]],
				    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
			    },
			lineWidth: 1,
			marker: {
                        enabled: false
			    },
			shadow: false,
			states: {
                        hover: {
                            lineWidth: 1
				}
                    },
			threshold: null
			}
            },
		}
	);

    //var chart = $('#windcontainer').highcharts();

}


function plotWind() {

    //Do time-alignment of two series
    var w = alignWindData();
    //Categorize wind data by direction and speed
    var windCatData = categorizeWindData(w);

    var nPoints=0;
    //Calculate total number of points for pct calculation
    for(var i=0;i<windCatData.length;i++) {
	for(var j=0;j<windCatData[i].length;j++) {
	    nPoints = nPoints + windCatData[i][j];
	}
    }

    plotData=[];
    //Gather data to be plotted by speed category
    for(var i=windCatData.length-1;i;i--) {
	//    for(var i=0;i<windCatData.length-1;i++) {
	var minSpeed = speedCategories[i-1];
	var maxSpeed = speedCategories[i];
	var wData = windCatData[i-1];
	
	//Calculate pct data
	var wPctData = [];
	for(var j=0;j<wData.length;j++) {
	    wPctData.push(100*wData[j]/nPoints);
	}

	var pData = [];
	for(var iDir=0;iDir<8;iDir++) {
	    //Convert direction index to angle
	    pData.push([45*iDir, wPctData[iDir]]);
	}
	if(i<windCatData.length-2) {
	    var catName=(minSpeed + " - " + maxSpeed + "m/s");
	} else {
	    var catName=(minSpeed + " - " + "m/s");
	}

	plotData.push({'name' : catName, 'data' : pData, 'color' : windSpeedColors[i]});
    }

    var chart = $('#windcontainer').highcharts();

    $('#windcontainer').highcharts({
    	//data: {  table: 'freq', startRow: 1, endRow: 17, endColumn: 7},
	  series: plotData,  
	    chart: {
	        polar: true,
	        type: 'column'
	    },
	    
	    title: {
	        text: 'Wind'
	    },
	    
	    pane: {
	    	size: '85%'
	    },
	    
	    legend: {
	    	reversed: true,
	    	align: 'right',
	    	verticalAlign: 'top',
	    	y: 100,
	    	layout: 'vertical'
	    },
	    
	    xAxis: {
	    tickmarkPlacement: 'on',
		tickInterval: 90,
		min: 0,
		max: 360
	    },
	        
	    yAxis: {
	        min: 0,
	        endOnTick: false,
	        showLastLabel: true,
	        title: {
	        	text: 'Frequency (%)'
	        },
	        labels: {
	        	formatter: function () {
	        		return this.value + '%';
	        	}
	        }
	    },
	    
	    tooltip: {
	    	valueSuffix: '%',
	    	followPointer: true
	    },
	        
		    plotOptions: {
	        series: {
	        	stacking: 'normal',
	        	shadow: false,
	        	groupPadding: 0,
		    pointPlacement: 'on',
		    
	        }
	    }
    
	});


}
