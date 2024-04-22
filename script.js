// only one input field

let lat = [];
let lon = [];
let locCount = 3;
let kmDist;
let totalDistance = 0;

let stopCodes = []; // Array to store all stop codes

const earthR = 6371;

// Define a function to fetch CSV data and convert it to JSON
function fetchAndConvertCsvToJson() {
    const apiUrl = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Fetch response as text
        })
        .then(csvData => {
            // Split the CSV data into lines
            const lines = csvData.split('\n');
            const jsonData = [];

            // Loop through each line
            lines.forEach(line => {
                // Split each line into fields, handling potential quotation marks
                const fields = line.split(',').map(field => field.replace(/"/g, ''));

                // Construct JSON object with specific fields
                const airport = {
                    id: parseInt(fields[0]),
                    name: fields[1],
                    city: fields[2],
                    country: fields[3],
                    code: fields[4],
                    latitude: parseFloat(fields[6]),
                    longitude: parseFloat(fields[7])
                    // Add more fields as needed
                };

                // Add the JSON object to the data array
                jsonData.push(airport);
            });

            return jsonData; // Return the JSON data
        })
        .catch(error => {
            console.error('Error:', error);
            return []; // Return empty array in case of error
        });
}

// Display Location coordinates and details based on airport code
function displayLocation(jsonData, stopCode) {
    const locationsContainer = document.getElementById("locations");
    const airportItem = document.createElement('div');
    const stopAirport = jsonData.find(airport => airport.code === stopCode);

    if (stopAirport) { // Check if airport is found
        airportItem.innerHTML = `
            <p>${stopAirport.code} - ${stopAirport.city}, ${stopAirport.country}</p>
        `;

        lat.push(stopAirport.latitude);
        lon.push(stopAirport.longitude);

        locationsContainer.appendChild(airportItem);

        // Update distance and CO2 emissions
        calcDist();
        co2Emissions();
    } else {
        console.error(`Airport ${stopCode} not found`);
    }
}

// Calculate distance between lat and long of two points:
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Calculate total distance by running distance calculation between every pair of stops and adding all distances together
function calcDist() {
    totalDistance = 0;
    for (let i = 0; i < lat.length - 1; i++) {
        let distLat = degreesToRadians(lat[i] - lat[i + 1]);
        let distLon = degreesToRadians(lon[i] - lon[i + 1]);

        let lat1 = degreesToRadians(lat[i]);
        let lat2 = degreesToRadians(lat[i + 1]);

        let a = Math.sin(distLat / 2) * Math.sin(distLat / 2) + Math.sin(distLon / 2) * Math.sin(distLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        totalDistance += earthR * c;
    }

    // Update the HTML content of kmDist with the calculated total distance
    kmDist.innerHTML = `
        <p>Total Distance: ${totalDistance.toFixed(2)} km</p>`;
}

// Calculate CO2 emissions based on distance traveled
function co2Emissions() {
    const CO = Math.floor(totalDistance * 0.115);
    const aroundEarth = totalDistance / 40075;

    // Update the HTML content of kmDist with the calculated distance and CO2 emissions
    kmDist.innerHTML += `
        <p>CO2 Emissions: ${CO} kg</p>
        <p>Times Around the Earth: ${aroundEarth}</p>`;
}

// Store lat and lon of airports submitted when button is clicked
document.addEventListener("DOMContentLoaded", function () {
    // Store lat and lon of airports submitted when button is clicked
    let addStopBtn = document.getElementById("add-stop");
    kmDist = document.getElementById("dist");

    addStopBtn.addEventListener("click", () => {
        let stopCodeInput = document.getElementById("stop-code");
        let stopCode = stopCodeInput.value.trim();

        if (stopCode !== "") {
            fetchAndConvertCsvToJson()
                .then(jsonData => {
                    displayLocation(jsonData, stopCode);
                });

            // Clear input field
            stopCodeInput.value = "";
        }
    });
});







