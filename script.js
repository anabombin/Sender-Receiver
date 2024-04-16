
let lat = [];
let lon = [];
const earthR = 6371;

// Define a function to fetch CSV data and convert it to JSON
function fetchAndConvertCsvToJson() {
    const apiUrl = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {// if the response finds an error, return the error 
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
                // Split each line into fields
                const fields = line.trim().split(',');

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

// Call the function when the page finishes loading
window.onload = function() {
    fetchAndConvertCsvToJson()
        .then(jsonData => {
            // Once the JSON data is fetched, call displayLocation with the data
            displayLocation1(jsonData);
            displayLocation2(jsonData);
            calcDist();
        });
};

// Display Location 1 coordinates, and name of a random airport
function displayLocation1(jsonData) {
    const airportList = document.getElementById('container');
    const airportItem = document.createElement('div');
    const randIndex = Math.floor(Math.random() * jsonData.length); // Generate random index within jsonData array

    const airport = jsonData[randIndex]; // Select a random airport from jsonData array

    airportItem.innerHTML = `
        <h2>${airport.name}</h2>
        <p>Name: ${airport.name}</p>
        <p>City: ${airport.city}</p>
        <p>Country: ${airport.country}</p>
        <p>Code: ${airport.code}</p>
        <p>Latitude: ${airport.latitude}</p>
        <p>Longitude: ${airport.longitude}</p>
    `;

    lat.push(airport.latitude);
    lon.push(airport.longitude);

    airportList.appendChild(airportItem);
}

// Display Location2 coordinates, and name of a random airport
function displayLocation2(jsonData) {
    const airportList = document.getElementById('container');
    const airportItem = document.createElement('div');
    const randIndex = Math.floor(Math.random() * jsonData.length); // Generate random index within jsonData array

    const airport = jsonData[randIndex]; // Select a random airport from jsonData array

    airportItem.innerHTML = `
        <h2>${airport.name}</h2>
        <p>Name: ${airport.name}</p>
        <p>City: ${airport.city}</p>
        <p>Country: ${airport.country}</p>
        <p>Code: ${airport.code}</p>
        <p>Latitude: ${airport.latitude}</p>
        <p>Longitude: ${airport.longitude}</p>
    `;
    // add latitude and longitude coordinated to each array
    lat.push(airport.latitude);
    lon.push(airport.longitude);

    airportList.appendChild(airportItem);
}

// Calculate distance between lat and long of two points:
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  // source: https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
// =acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon2-lon1))*6371 (6371 is Earth radius in km.)
function calcDist() {
    const kmDist = document.getElementById("dist");

    // Define the Earth's radius in kilometers
    const earthR = 6371;

    let distLat = degreesToRadians(lat[0] - lat[1]);
    let distLon = degreesToRadians(lon[0] - lon[1]);

    let lat1 = degreesToRadians(lat[0]);
    let lat2 = degreesToRadians(lat[1]);

    let a = Math.sin(distLat/2) * Math.sin(distLat/2) + Math.sin(distLon/2) * Math.sin(distLon/2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 

    let displayDist = earthR * c;

    // Update the HTML content of kmDist with the calculated distance
    kmDist.innerHTML = `
        <p>Distance: ${displayDist.toFixed(2)} km</p>`;

    console.log(lat);
}






// function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
//     var earthRadiusKm = 6371;
  
//     var dLat = degreesToRadians(lat2-lat1);
//     var dLon = degreesToRadians(lon2-lon1);
  
//     lat1 = degreesToRadians(lat1);
//     lat2 = degreesToRadians(lat2);
  
//     var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//             Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//     return earthRadiusKm * c;
//   }

