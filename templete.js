// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = 700;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    const groups = [...new Set(data.map(d => d.AgeGroup))];
    const xScale = d3.scaleBand()
        .domain(groups)
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yMin = d3.min(data, d => d.Likes);
    const yMax = d3.max(data, d => d.Likes);

    const yScale = d3.scaleLinear()
        .domain([yMin, yMax]).nice()
        .range([height - margin.bottom, margin.top]);

    // Add scales     
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);

    // Add x-axis label
    svg.append("text")
        .attr("x", (width) / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Age Group");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .text("Likes");
    

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.50);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        const iqr = q3 - q1;
        return {min, q1, median, q3, max, iqr};
    };

    //Group data by AgeGroup, and find min, q1, median, q3, max, iqr for each group
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    //runs through each age group and draws the box plot
    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        const center = x + boxWidth / 2; 
        svg.append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "#555")
            .attr("stroke-width", 2);
        // Draw box
        
        svg.append("rect")
            .attr("x", center - (boxWidth * 0.6) / 2)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth * 0.6)
            .attr("height", Math.max(1, yScale(quantiles.q1) - yScale(quantiles.q3)))
            .attr("fill", "#ffffff")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);

        // Draw median line
        svg.append("line")
            .attr("x1", center - (boxWidth * 0.6) / 2)
            .attr("x2", center + (boxWidth * 0.6) / 2)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "#1b1f24")
            .attr("stroke-width", 2);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("./socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 700;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])  // Unique platforms
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])  // Unique post types
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])  // Max AvgLikes
        .nice()
        .range([height - margin.bottom, margin.top]);
    

    const color = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.PostType))])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
        
    svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x0));
    
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .text("Average Likes");

// Group container for bars
    const barGroups = svg.selectAll(".bar-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(${x0(d.Platform)},0)`);

// Draw bars
    barGroups.append("rect").attr("x", d => x1(d.PostType))
                            .attr("y", d => y(d.AvgLikes))  
                            .attr("width", x1.bandwidth()) 
                            .attr("height", d => height - margin.bottom - y(d.AvgLikes))  
                            .attr("fill", d => color(d.PostType)); 
    

    // Add the legend
    const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
    legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(type)
        .attr("alignment-baseline", "middle");
    });

})
.catch(function(err){
    console.error("Failed to load socialMediaAvg.csv", err);
    d3.select("#barplot").append("div").text("Error loading socialMediaAvg.csv (" + err + ")");
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    

    // Define the dimensions and margins for the SVG
    

    // Create the SVG container
    

    // Set up scales for x and y axes  


    // Draw the axis, you can rotate the text in the x-axis here


    // Add x-axis label
    

    // Add y-axis label


    // Draw the line and path. Remember to use curveNatural. 

});
