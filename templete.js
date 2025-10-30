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
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 100, bottom: 60, left: 60 }; // Increased right margin for legend space
    const width = 700;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define four scales
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

    // Add x0-axis (Platform)
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x0));

    // Add x1-axis (PostType) — make sure it’s placed correctly inside each Platform group
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .selectAll(".x1-axis")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)}, 0)`)
        .call(d3.axisBottom(x1));

    // Add y-axis (AvgLikes)
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
        .attr("transform", d => `translate(${x0(d.Platform)}, 0)`);

    // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))  
        .attr("width", x1.bandwidth())   
        .attr("height", d => height - margin.bottom - y(d.AvgLikes))  
        .attr("fill", d => color(d.PostType));  // Set the color based on PostType

    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, ${margin.top})`); // Move the legend further to the right

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        // Add text next to each color box
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .attr("text-anchor", "start")
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = 700;
    const height = 400;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Set up scales for x and y axes  
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.Date)))  // Use d3.extent to get the min/max Date
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])  // Max AvgLikes
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Draw the axis, you can rotate the text in the x-axis here
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%m/%d/%Y"));

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis);
    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(new Date(d.Date)))  // Use Date for the x-coordinates
        .y(d => yScale(d.AvgLikes))  // Use AvgLikes for the y-coordinates
        .curve(d3.curveNatural);  // Use curveNatural for a smooth curve

    // Draw the line path
    svg.append("path")
        .data([data])  // The line takes the data as a list of points
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2);

    // Rotate the x-axis labels to prevent overlap
    svg.selectAll(".x-axis text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");
});

