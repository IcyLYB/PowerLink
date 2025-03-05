//Add script for ThingSpeak chart
// Initialize the charts
var voltageChartContext = document.getElementById('solarChart').getContext('2d');
var currentChartContext = document.getElementById('currentChart').getContext('2d');
var voltageChart;
var currentChart;
var isLoading = false;

// Function to show loading state
function showLoading() {
    if (!isLoading) {
        isLoading = true;
        document.getElementById('lastUpdate').innerHTML = 'Loading data...';
    }
}

// Function to fetch and update data
function updateCharts() {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    showLoading();
    console.log('Attempting to fetch ThingSpeak data...');
    
    $.getJSON('https://api.thingspeak.com/channels/2863462/feeds.json?api_key=C51O1PASYNHKLMFY&results=20')
        .done(function(data) {
            isLoading = false;
            console.log('Data received from ThingSpeak:', data);
            
            if (data.feeds && data.feeds.length > 0) {
                var feeds = data.feeds;
                console.log('Number of data points:', feeds.length);
                console.log('Latest voltage value:', feeds[feeds.length-1].field3);
                console.log('Latest current value:', feeds[feeds.length-1].field4);
                
                var labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
                var voltageValues = feeds.map(feed => parseFloat(feed.field3) || 0);
                var currentValues = feeds.map(feed => parseFloat(feed.field4) || 0);

                // Update Voltage Chart
                if (!voltageChart) {
                    voltageChart = new Chart(voltageChartContext, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Solar Panel Voltage',
                                data: voltageValues,
                                borderColor: '#FFD700', // Gold color for solar
                                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 750
                            },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true,
                                        max: 3.5,
                                        stepSize: 0.5,
                                        callback: function(value) {
                                            return value + ' V';
                                        }
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Voltage (V)'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Solar Panel (Voltage)',
                                fontSize: 16,
                                padding: 20
                            }
                        }
                    });
                } else {
                    voltageChart.data.labels = labels;
                    voltageChart.data.datasets[0].data = voltageValues;
                    voltageChart.update('none');
                }

                // Update Current Chart
                if (!currentChart) {
                    currentChart = new Chart(currentChartContext, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Solar Panel Current',
                                data: currentValues,
                                borderColor: '#FFA500', // Orange color for solar current
                                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 750
                            },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true,
                                        max: 8,
                                        stepSize: 1,
                                        callback: function(value) {
                                            return value + ' mA';
                                        }
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Current (mA)'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Solar Panel (Current)',
                                fontSize: 16,
                                padding: 20
                            }
                        }
                    });
                } else {
                    currentChart.data.labels = labels;
                    currentChart.data.datasets[0].data = currentValues;
                    currentChart.update('none');
                }

                document.getElementById('lastUpdate').innerHTML = 
                    'Last Updated: ' + new Date().toLocaleString() + 
                    '<br>Latest voltage: ' + (feeds[feeds.length-1].field3 || 'No data') + ' V' +
                    '<br>Latest current: ' + (feeds[feeds.length-1].field4 || 'No data') + ' mA';
            } else {
                console.log('No data available in the feed');
                document.getElementById('lastUpdate').innerHTML = 
                    'No data available. Last check: ' + new Date().toLocaleString();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            isLoading = false;
            console.error('Failed to fetch ThingSpeak data:', textStatus, errorThrown);
            document.getElementById('lastUpdate').innerHTML = 
                'Error fetching data. Last attempt: ' + new Date().toLocaleString() +
                '<br>Please check your internet connection and try again.';
        });
}

// Update charts initially and every 15 seconds
updateCharts();
setInterval(updateCharts, 15000);
