//Add script for ThingSpeak chart
// Initialize the charts
var voltageChartContext = document.getElementById('consumptionChart').getContext('2d');
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
                console.log('Latest voltage value:', feeds[feeds.length-1].field1);
                console.log('Latest current value:', feeds[feeds.length-1].field2);
                
                var labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
                var voltageValues = feeds.map(feed => parseFloat(feed.field1) || 0);
                var currentValues = feeds.map(feed => parseFloat(feed.field2) || 0);

                // Update Voltage Chart
                if (!voltageChart) {
                    voltageChart = new Chart(voltageChartContext, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Voltage',
                                data: voltageValues,
                                borderColor: '#FF6B6B',
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
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
                                        max: 1.2,
                                        stepSize: 0.2,
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
                                text: 'Electricity Transmission (Voltage)',
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
                                label: 'Current',
                                data: currentValues,
                                borderColor: '#4A90E2',
                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
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
                                        max: 3,
                                        stepSize: 0.5,
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
                                text: 'Electricity Transmission (Current)',
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
                    '<br>Latest voltage: ' + (feeds[feeds.length-1].field1 || 'No data') + ' V' +
                    '<br>Latest current: ' + (feeds[feeds.length-1].field2 || 'No data') + ' mA';
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
