var all = d3.json("samples.json"); // Assign the json response to a variable
var subjects = d3.select("#selDataset");

function init() { // Function to start the page
    
    var options = subjects.selectAll("option"); // Select the select element and the options to be appended

    all.then((json) => { // Do something with the json response
        options.data(json.names) // Bind the names to the option element
            .enter() // Select the elements that are new
            .append("option") // Add them under the option element
            .attr("value", (d, i) => `${d}`) // Assign a value equal to the id
            .html(d => d); // Modify its HTML to display the value

        //var wash = json.metadata.map(wash => wash.wfreq); // Get all the washing data
        //console.log(d3.extent(wash)); // Print the range in washing frequency
        // max = [];
        // min = [];
        // extent = [];
        // json.samples.forEach(si => {
        //     max.push(d3.max(si.sample_values));
        //     min.push(d3.min(si.sample_values));
        // })
        // extent.push(d3.min(min));
        // extent.push(d3.max(max));
        // console.log(extent);
    });

    demographic("940"); // Initialize the page with the demographic data of the first sample

    charts("940"); // Initialize the page with the specimen pie chart for the first sample
};

function gauge(wash) { // Gauge

    var gData = [{ // Arrow data
        type: 'category',
        x: [0],
        y:[0],
        marker: {size: 25, color:'850000'},
        showlegend: false,
        name: wash,
        // text: wash,
        hoverinfo: 'text+name',
        },

        { // Analog gauge chart data (usngn a pie chart design)
        type: "pie",
        showlegend: false,
        hole: .5, // Make a donut-like hole in the pie
        rotation: 90,
        values: [18, 18, 18, 18, 18, 90], // Each portion of the pie size, 90 is for the white bottom
        // text: ["0-1", "2-3", "4-5", "6-7", "8-9", ""], // Por si se vuelve a invertir
        text: ["8-9", "6-7", "4-5", "2-3", "0-1", ""], // The last string is empty (bottom, white part)
        textinfo: 'text',
        textposition:'inside',  
        textfont: {
            color: "rgb(220,220,220)",
        },    
        marker: {
            colors:[
                'rgba(14, 127, 0, .5)',
                'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)',
                'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)',
                'rgba(255, 255, 255, 0)' // White color to hide the bottom

                // Por si se vuelve a invertir
                // 'rgba(210, 206, 145, .5)',
                // 'rgba(202, 209, 95, .5)',
                // 'rgba(170, 202, 42, .5)',
                // 'rgba(110, 154, 22, .5)',
                // 'rgba(14, 127, 0, .5)',
            ],
        },
        // labels: ['0-1', '2-3', '4-5', '6-7', '8-9', ''], // Por si se vuelve a invertir
        labels: ["8-9", "6-7", "4-5", "2-3", "0-1", " "], // The last string is empty (bottom, white part)
        hoverinfo: 'label', // Shows the labels when hover on the pie portion
        automargin: true,
    }];

    // Trigonometry to calculate meter point for each input value
    var degrees = 180 - wash * 20; // Calculate the angle for the counterclockwis rotation
    var radius = .65; // Arrow length
    var radians = degrees * Math.PI / 180; // Change angle from degrees to radians
    var x = radius * Math.cos(radians); // Calculate the arrow path width
    var y = radius * Math.sin(radians); // Calculate the arrow path length 

    // Arrow path (makes a triangle)
    var mainPath = 'M -.0 -0.035 L .0 0.035 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var gLayout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: 'Belly Button Washing Frequency',
        xaxis: {type:'category',zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
        yaxis: {type:'category',zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
        plot_bgcolor: "#001845",
        paper_bgcolor:"#001845",
        font: {
            color: "rgb(220,220,220)",
        }
    };

    Plotly.newPlot('gauge', gData, gLayout);

    // Gauge function based on the following examples:
    // https://jsfiddle.net/b98tj88j/3/
    // https://codepen.io/Shokeen/pen/prNzpN
}

function demographic(value) { // Demographic Info

    all.then((json) => { // Do something with the json response
        
        // ---------------------------------------------- DATA HANDLING -----------------------------------------
        
        demo_data = json.metadata.filter(id => id.id == value); // Filter the metadata for the selected sample
        data = demo_data[0]; // Select the Object index 0 data
        // console.log(data); // Prints the received data to validate

        // ------------------------------------------------- PANEL ----------------------------------------------

        var panel = d3.select("#sample-metadata"); // Select the panel
        panel.html(""); // Clear panel HTML

        Object.entries(data).forEach(([key, value]) => { // Loop through each key-value pair
            panel.append("p").html(`${key.toUpperCase()}: ${value}<br>`); // Add a "p" element and modify its HTML
            // console.log("Si jala"); // Prints a working-confirmation string
        });

        //-------------------------------------------------- BONUS ----------------------------------------------

        var wash = data.wfreq; // Get the washing information
        // console.log(wash);
        gauge(wash); // Call the function to build the gauge
    })
};

function charts(value) { // Pie & Bubble Charts

    all.then((json) => { // Do something with the json response
        
        // ---------------------------------------------- DATA HANDLING -----------------------------------------

        var samples = json.samples; // Get all the OTU data
        var filteredSamples = samples.filter(id => id.id == value); // Filter the OTU data for the selected sample
        var OTUs = filteredSamples[0]; // Select the Object index 0 data
        
        var idOTU = OTUs.otu_ids; // Assign the otu ids to a variable
        var nameOTU = OTUs.otu_labels; // Assign the otu labels to a variable
        var sampleValues = OTUs.sample_values; // Assign the sample values to a variable


        //---------------------------------------------------- PIE ----------------------------------------------
        
        var pie = d3.select("#pie"); // Select the pie chart
        pie.html(""); // Clear pie chart HTML

        var OTUnames = []; // Create empty array to store the pie chart labels 
        var OTUvalues = []; // Create empty array to store the pie chart values

        for (var i=0; i<10; i++) { // Loop through the OTU data
            OTUnames.push(idOTU[i]); // Push the OTU name to the label array
            OTUvalues.push(sampleValues[i]); // Push the OTU count to the values array
        }

        var pData = [{ // Create the data for the chart
            labels: OTUnames,
            values: OTUvalues,
            type: "pie", // Set the chart type to pie
            textfont: {
                color: "whitesmoke",
            },
            automargin: true,
        }];

        var pLayout = { // Set the layout for the pie chart
            title: "Top 10 OTUs",
            paper_bgcolor:"#001845",
            font: {
                color: "rgb(220,220,220)",
            }
        };

        Plotly.newPlot('pie', pData, pLayout); // Plot the pie chart

        //--------------------------------------------------- BUBBLE ---------------------------------------------
        
        var bubble = d3.select("#bubble"); // Select the bubble chart
        bubble.html("");  // Clear bubble chart HTML

        var bData = [{ // Create the data for the chart
            type: "scatter",
            x: idOTU,
            y: sampleValues,
            text: nameOTU,
            mode: "markers",
            marker: {
                size: sampleValues,
                color: sampleValues,
                colorscale: "Hot",          
            },
        }];

        var bLayout = {
            title: "OTU Sample Data",
            margin: {t: 0},
            hovermode: "closest",
            xaxis: {title: "OTU ID"},
            yaxis: {title: "Sample Values"},
            margin: {t: 30},
            plot_bgcolor: "#001845",
            paper_bgcolor:"#001233",
            font: {
                color: "rgb(220,220,220)",
            }
        };

        Plotly.newPlot("bubble", bData, bLayout);

   })
};

// Modify page based on selector
subjects.on("change", optionChanged);

function optionChanged() { // Function to update page based on selector

    var value = subjects.property("value"); // Assign the value from the select to a variable
    
    // console.log(value); // Print the selected value for verification

    demographic(value); // Call the function to build demographic data

    charts(value); // Call the function to build the charts

}

init();