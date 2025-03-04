//Add script for ThingSpeak chart
// Initialize the chart
var chartContext = document.getElementById('consumptionChart').getContext('2d');
var consumptionChart;

// Function to fetch and update data
function updateChart() {
    console.log('Attempting to fetch ThingSpeak data...');
    
    $.getJSON('https://api.thingspeak.com/channels/2815587/feeds.json?api_key=T7QNUY5YBUNOGBDI&results=20')
        .done(function(data) {
            console.log('Data received from ThingSpeak:', data);
            
            if (data.feeds && data.feeds.length > 0) {
                var feeds = data.feeds;
                console.log('Number of data points:', feeds.length);
                console.log('Latest field1 value:', feeds[feeds.length-1].field1);
                
                var labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
                var values = feeds.map(feed => feed.field1); // Adjust field number if needed

                if (!consumptionChart) {
                    consumptionChart = new Chart(chartContext, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Energy Consumption',
                                data: values,
                                borderColor: '#3CB371',
                                backgroundColor: 'rgba(60, 179, 113, 0.1)',
                                borderWidth: 2,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Energy Usage (kWh)'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }]
                            }
                        }
                    });
                } else {
                    consumptionChart.data.labels = labels;
                    consumptionChart.data.datasets[0].data = values;
                    consumptionChart.update();
                }

                document.getElementById('lastUpdate').innerHTML = 
                    'Last Updated: ' + new Date().toLocaleString() + 
                    '<br>Latest value: ' + (feeds[feeds.length-1].field1 || 'No data');
            } else {
                console.log('No data available in the feed');
                document.getElementById('lastUpdate').innerHTML = 
                    'No data available. Last check: ' + new Date().toLocaleString();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to fetch ThingSpeak data:', textStatus, errorThrown);
            document.getElementById('lastUpdate').innerHTML = 
                'Error fetching data. Last attempt: ' + new Date().toLocaleString();
        });
}

// Update chart initially and every 15 seconds
updateChart();
setInterval(updateChart, 15000);
