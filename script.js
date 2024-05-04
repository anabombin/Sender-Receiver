
//Global variables & arrays
let lat = [];
let lon = [];
let locCount = 3;
let kmDist;
let totalDistance = 0;
let distances = []; // Array to store distances between points
var canvas;
let wMap;
let paperW;
let paperH;
let flowers = [];
let paper;
let placeholder;


// sketch variables
let drops = [];

const earthR = 6371;

function preload() {
    // wMap = loadImage("assets/map-coordinates.png");
    paper = loadImage("assets/paper.jpeg");
    placeholder = loadImage("assets/placeholder.png");
}

// p5.js canvas
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0,0);
    canvas.style('z-index', '-1');
    fetchAndConvertCsvToJson()
    .then(jsonData => {
        displayLocation(jsonData, 'InitialCode'); // Add an initial value to lat
    });


    //Placeholder values on load
    // filling arrays
    for (let i = 0; i<20; i++){
        append(lat, random(0, windowHeight));
        append(lon, random(0, windowWidth));
    }

    paperW = paper.width/3;
    paperH = paper.height/3;
    // placeholderW = placeholder.width/3;
    // placeholderH = placeholder.height/3;
    placeholderW = windowWidth;
    placeholderH = windowHeight;

    image(placeholder, 0, 0, placeholderW, placeholderH);
}



function addInk(x, y, r) {
    let drop = new Drop(x, y, r);
  
    for (let other of drops) {
      other.marble(drop);
    }
    drops.push(drop);
  }



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

        // Add a drop using the last value of lon and lat
        addInk(map(lon[lon.length - 1], -180, 180, 0, windowWidth), map(lat[lat.length - 1], 90, -90, 0, windowHeight), map(distances[distances.length - 1], 200, 16000, 5, 100));

        // Draw the paper image
        image(paper, 0, 0, paperW, paperH);

        // Show all drops
        for (let drop of drops) {
            drop.show();
        }
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
    distances = [];
    for (let i = 0; i < lat.length - 1; i++) {
        let distLat = degreesToRadians(lat[i] - lat[i + 1]);
        let distLon = degreesToRadians(lon[i] - lon[i + 1]);

        let lat1 = degreesToRadians(lat[i]);
        let lat2 = degreesToRadians(lat[i + 1]);

        let a = Math.sin(distLat / 2) * Math.sin(distLat / 2) + Math.sin(distLon / 2) * Math.sin(distLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let distance = earthR * c;
        totalDistance += distance;
        distances.push(distance); // Store the distance
    }
    console.log(distances);

    // Update the HTML content of kmDist with the calculated total distance
    kmDist.innerHTML = `
        <p>Total Distance: ${totalDistance.toFixed(2)} km</p>`;
}

// Calculate CO2 emissions based on distance traveled
function co2Emissions() {
    const CO = Math.floor(totalDistance * 0.115);
    const aroundEarth = totalDistance / 40075;
    const roundedAroundEarth = parseFloat(((aroundEarth * 100)/100).toFixed(2));

    // Update the HTML content of kmDist with the calculated distance and CO2 emissions
    kmDist.innerHTML += `
        <p>CO2 Emissions: ${CO} kg</p>
        <p>Times Around the Earth: ${roundedAroundEarth}</p>`;
}

// Store lat and lon of airports submitted when button is clicked
document.addEventListener("DOMContentLoaded", function () {
    // Store lat and lon of airports submitted when button is clicked
    let addStopBtn = document.getElementById("add-stop");
    let saveBtn = document.getElementById("save");
    kmDist = document.getElementById("dist");

    addStopBtn.addEventListener("click", () => {
        let stopCodeInput = document.getElementById("stop-code");
        let stopCode = stopCodeInput.value.trim();

        if (stopCode !== "") {
            fetchAndConvertCsvToJson()
                .then(jsonData => {
                    displayLocation(jsonData, stopCode);
                    isNewLatAdded = true;
                });

            // Clear input field
            stopCodeInput.value = "";
        }
    });

    //Save canvas sketch (data viz)
    saveBtn.addEventListener("click", () => {
              saveCanvas();
    });
});

// toggle hid & unhide windows
$( document ).ready(function() {

    // Close travel record info window
    $("#minus-rec").click(function(){
        $("#dist").toggle();
    });

    // Close travel destinations window
    $("#minus-dest").click(function(){
        $(".input-info").toggle()
        $("#locations").toggle()
    });


});








// function draw() {
//     console.time('draw');
//     background(1800); // Clear canvas

//     // Check if the sketch needs to be reloaded
//     if (reloadSketch) {
//         // Clear arrays
//         distances = [];
//         flowers = [];
//         // Redraw all flowers in the arrays
//         for (let i = 1; i < lat.length; i++) {
//             // Add code to draw flowers based on lat and lon
//             let posX = map(lon[i], -180, 180, 0, windowWidth);
//             let posY = map(lat[i], 90, -90, 0, windowHeight);
//             let branches = i + 3;
//             let hue = distances[i - 1] * 0.115; // Random hue value
//             let diameter = map(distances[i - 1] * 0.115, 0.31, 1800, 10, 200); // Random diameter value
//             let newFlower = new Flower(posX, posY, branches, hue, diameter);
//             flowers.push(newFlower);
//         }
//         reloadSketch = false; // Reset reload flag after redrawing
//     }

//     // Draw all flowers
//     for (let flower of flowers) {
//         flower.display();
//     }

//     console.timeEnd('draw');
// }




// function draw() {
//     console.time('draw');
//     background("#33658A");
//     background(1800);
//     //world map
//     // image(wMap, 30, 20, windowWidth, windowHeight);

//     //Grid lines
//     stroke("#19a6be");
//     for (let i=1; i<windowWidth; i+=50){
//         line(i, 0, i, windowHeight);
//     }
//     for (let i=1; i<windowHeight; i+=50){
//         line(0, i, windowWidth, i);
//     }

//     // Draw flowers
//     for (let i = 1; i < lat.length; i++) {
//         let posX = map(lon[i], -180, 180, 0, windowWidth);
//         let posY = map(lat[i], 90, -90, 0, windowHeight);
//         let branches = i+3;
//         let hue = distances[i-1]*0.115; // Random hue value
//         let diameter = map(distances[i - 1] * 0.115, 0.31, 1800, 10, 200); // Random diameter value
//         let newFlower = new Flower(posX, posY, branches, hue, diameter);
//         flowers.push(newFlower);
//     }
//         // Draw flowers
//     for (let flower of flowers) {
//         // flower.grow();
//         flower.display();
//     }

    
//     console.timeEnd('draw');
// }




// //moss flower class
// class Flower {
//     constructor(x, y, branches, hue, diameter) {
//         this.x = x;
//         this.y = y;
//         this.branches = min(branches, 10); // Limit branches to a maximum of 10
//         this.angle = map(this.branches, 4, 10, 0.6, 0.1); // Adjust angle based on branches
//         this.hue = hue; // Hue value for the flower color
//         this.diameter = diameter; // Diameter of the flower
//         this.maxDepth = 3; // Limit recursion depth to 3
//     }

//     display() {
//         stroke(this.hue, 100, 100); // Set stroke color based on hue
//         this.drawFlower(this.x, this.y, this.diameter, this.branches, 0); // Start with depth 0
//     }

//     drawFlower(x, y, diameter, branches, depth) {
//         let len = diameter / 2; // Length of the branch
//         for (let i = 0; i < branches; i++) {
//             push();
//             translate(x, y); // Translate to the flower's position
//             rotate(TWO_PI / branches * i);
//             this.drawBranch(len, this.maxDepth, depth); // Pass the max depth and current depth
//             pop();
//         }
//     }

//     drawBranch(len, maxDepth, depth) {
//         line(0, 0, 0, -len);
//         translate(0, -len);
//         if (depth < maxDepth) { // Check depth limit
//             push();
//             rotate(this.angle);
//             this.drawBranch(len * 0.67, maxDepth, depth + 1); // Increment depth
//             pop();
//             push();
//             rotate(-this.angle);
//             this.drawBranch(len * 0.67, maxDepth, depth + 1); // Increment depth
//             pop();
//         }
//     }
// }

  










