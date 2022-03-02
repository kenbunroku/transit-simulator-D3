// https://observablehq.com/@shinichirokuwahara/transit-project@3033
import define1 from "./e93997d5089d7165@2303.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Transit Simulator`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
This is a simulator to experiment **how people choose a transit mode in a city, and how the choise would affect their satisfaction, urban infrastructures or mobility policies in a city**. You can create a city that has stations and links of each transit method, train, bike, car and walk. Then, after setting the number of passengers and the number of movement, you can run the simulator.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Your city map is automatically generated and the simulation seamlessly runs. You can see how many simulation steps finised below the map`
)});
  main.variable(observer("world")).define("world", ["d3","width","height","backgroundColor"], function*(d3,width,height,backgroundColor)
{
  //create SVG artboard
  let svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("id", "mainSimulation");

  let bg = svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", backgroundColor);

  yield svg.node();
}
);
  main.variable(observer("simulation")).define("simulation", ["d3","history","createStations","createLinks","createPassengers","createWorld","simulationSteps","Promises","genTime","transitsPerSimulation","move","updateLineChart","updateSideEffectMonitor","financeBalance"], async function*(d3,history,createStations,createLinks,createPassengers,createWorld,simulationSteps,Promises,genTime,transitsPerSimulation,move,updateLineChart,updateSideEffectMonitor,financeBalance)
{
  //wipe screen
  d3.select('#transitMapGroup').remove();
  let generation = 0;

  //clear history arrays - not running these lines will enable persistence between sim runs.
  history.satisfaction = [];
  history.passengers = [];
  history.links = [];
  history.stations = [];
  history.traffic = [];
  history.noise = [];
  history.co2 = [];
  history.subsidy = [];
  history.upgradeNumber = [];
  history.finance = [];

  createStations();
  createLinks();
  createPassengers();
  await createWorld();

  while (generation < simulationSteps) {
    //wait between generations for animations to complete
    await Promises.delay(genTime);

    //create new generation in satisfaction history
    history.satisfaction.push({
      generationNumber: generation,
      passengerSatisfaction: [],
      walkSatisfaction: [],
      bikeSatisfaction: [],
      trainSatisfaction: [],
      carSatisfaction: []
    });

    history.traffic.push({
      generationNumber: generation,
      roadTraffic: []
    });

    history.noise.push({
      generationNumber: generation,
      roadNoise: []
    });

    history.co2.push({
      generationNumber: generation,
      carbonEmission: []
    });

    history.subsidy.push({
      generationNumber: generation,
      subsidizedMoney: []
    });

    history.upgradeNumber.push({
      generationNumber: generation,
      upgradeNumber: []
    });

    history.finance.push({
      generationNumber: generation,
      fixedCost: 0,
      totalVariableCost: 0,
      variableCost: 0,
      budgetBalance: 0
    });

    //iterate through passenger choices
    for (let transit = 0; transit < transitsPerSimulation; transit++) {
      let traveler = move();

      history.satisfaction[generation].passengerSatisfaction.push(
        traveler.satisfaction.toFixed(2)
      );
      if (traveler.lastMode === "walk") {
        history.satisfaction[generation].walkSatisfaction.push(
          traveler.satisfaction.toFixed(2)
        );
      } else if (traveler.lastMode === "bike") {
        history.satisfaction[generation].bikeSatisfaction.push(
          traveler.satisfaction.toFixed(2)
        );
      } else if (traveler.lastMode === "train") {
        history.satisfaction[generation].trainSatisfaction.push(
          traveler.satisfaction.toFixed(2)
        );
      } else {
        history.satisfaction[generation].carSatisfaction.push(
          traveler.satisfaction.toFixed(2)
        );
      }
    }
    for (let i = 0; i < history.links.length; i++) {
      history.traffic[generation].roadTraffic.push(history.links[i].traffic);
      history.noise[generation].roadNoise.push(history.links[i].noise);
    }

    for (let i = 0; i < history.passengers.length; i++) {
      history.co2[generation].carbonEmission.push(
        history.passengers[i].carbonEmission
      );
      history.subsidy[generation].subsidizedMoney.push(
        history.passengers[i].subsidizedMoney
      );
    }

    for (let i = 0; i < history.stations.length; i++) {
      history.upgradeNumber[generation].upgradeNumber.push(
        history.stations[i].upgraded
      );
    }
    updateLineChart(generation);
    updateSideEffectMonitor(generation);
    financeBalance(generation);
    generation++;

    yield "Simulating generation " +
      generation +
      " out of " +
      simulationSteps +
      " generations total.";
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`
### Visualization Settings

First of all, you can set up city visual design with these parameters.
`
)});
  main.variable(observer("viewof width")).define("viewof width", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 1000,
  step: 50,
  value: 800,
  title: "SVG Width"
})
)});
  main.variable(observer("width")).define("width", ["Generators", "viewof width"], (G, _) => G.input(_));
  main.variable(observer("viewof height")).define("viewof height", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 1000,
  step: 50,
  value: 800,
  title: "SVG Height"
})
)});
  main.variable(observer("height")).define("height", ["Generators", "viewof height"], (G, _) => G.input(_));
  main.variable(observer("viewof margin")).define("viewof margin", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 5,
  value: 50,
  title: "SVG Margin"
})
)});
  main.variable(observer("margin")).define("margin", ["Generators", "viewof margin"], (G, _) => G.input(_));
  main.variable(observer("viewof gridResolution")).define("viewof gridResolution", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 10,
  value: 30,
  title: "Grid Resolution",
  description:
    "You can decide how small each segmented block would be in a city"
})
)});
  main.variable(observer("gridResolution")).define("gridResolution", ["Generators", "viewof gridResolution"], (G, _) => G.input(_));
  main.variable(observer("viewof stationSize")).define("viewof stationSize", ["slider"], function(slider){return(
slider({
  min: 10,
  max: 30,
  step: 1,
  value: 20,
  title: "Station Size"
})
)});
  main.variable(observer("stationSize")).define("stationSize", ["Generators", "viewof stationSize"], (G, _) => G.input(_));
  main.variable(observer("viewof scaleFactor")).define("viewof scaleFactor", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 1,
  step: .01,
  value: .9,
  title: "Main Scale Factor",
  description:
    "The larger you would like to make a city, the smaller the scale number should be"
})
)});
  main.variable(observer("scaleFactor")).define("scaleFactor", ["Generators", "viewof scaleFactor"], (G, _) => G.input(_));
  main.variable(observer("viewof stationCount")).define("viewof stationCount", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 5,
  value: 20,
  title: "Station Count"
})
)});
  main.variable(observer("stationCount")).define("stationCount", ["Generators", "viewof stationCount"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`
### Simulation Settings

Set how many passengers move in your city, how many times the simulation runs and animates, and how fast the simulation runs.
`
)});
  main.variable(observer("viewof passengerCount")).define("viewof passengerCount", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 50,
  step: 5,
  value: 10,
  title: "Passenger Count"
})
)});
  main.variable(observer("passengerCount")).define("passengerCount", ["Generators", "viewof passengerCount"], (G, _) => G.input(_));
  main.variable(observer("viewof simulationSteps")).define("viewof simulationSteps", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 1,
  value: 25,
  title: "Simulation Steps"
})
)});
  main.variable(observer("simulationSteps")).define("simulationSteps", ["Generators", "viewof simulationSteps"], (G, _) => G.input(_));
  main.variable(observer("viewof transitsPerSimulation")).define("viewof transitsPerSimulation", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 50,
  step: 1,
  value: 15,
  title: "Transit Movements per Simulation"
})
)});
  main.variable(observer("transitsPerSimulation")).define("transitsPerSimulation", ["Generators", "viewof transitsPerSimulation"], (G, _) => G.input(_));
  main.variable(observer("viewof genTime")).define("viewof genTime", ["slider"], function(slider){return(
slider({
  min: 100,
  max: 5000,
  step: 1,
  value: 2000,
  title: "Time per Simulation Step"
})
)});
  main.variable(observer("genTime")).define("genTime", ["Generators", "viewof genTime"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Main Simulation
`
)});
  main.variable(observer("move")).define("move", ["history","pick","getDistance","passengerCount","genTime","discountBikeFare","discountTrainFare","subsidizeCarprice","discountPatrol","increasePatrol","d3","findMidPoint","stationUpdate","passengerUpdate","linkUpdate"], function(history,pick,getDistance,passengerCount,genTime,discountBikeFare,discountTrainFare,subsidizeCarprice,discountPatrol,increasePatrol,d3,findMidPoint,stationUpdate,passengerUpdate,linkUpdate){return(
function() {
  for (let i = 0; i < history.stations.length; i++) {
    if (history.stations[i].popularity <= 0) {
      history.stations[i].popularity = 0;
    }
  }

  let fromStation = pick(history.stations);
  let toStation = pick(history.stations);

  //ensure start and end are not the same station
  while (fromStation == toStation) {
    fromStation = pick(history.stations);
    toStation = pick(history.stations);
  }

  let distance = getDistance(
    fromStation.x,
    fromStation.y,
    toStation.x,
    toStation.y
  );

  // Choose a traveler at random
  let traveler = history.passengers[Math.floor(Math.random() * passengerCount)];

  let color = "white";
  let speed = genTime;
  let cost = 0;
  let bikeCost = 3 - discountBikeFare;
  let trainCost = 3 - discountTrainFare;
  let carCost =
    9 +
    3 +
    5 -
    (subsidizeCarprice / (7 * 365) - discountPatrol + increasePatrol);
  let carbonEmission = 0;

  // If a train is available
  for (let i = 0; i < history.stations.length; i++) {
    if (history.stations[i].train === 1) {
      // Consider desaire and affordability
      // Change speed depends on transportation method
      if (distance < 200) {
        traveler.travelDesire = traveler.travelDesire;
      } else if (distance < 300 && traveler.budget > bikeCost) {
        traveler.travelDesire += traveler.bikeBonus;
        color = "blue";
        speed = genTime * .5;
        cost = bikeCost;
      } else if (distance < 500 && traveler.budget > trainCost) {
        traveler.travelDesire += traveler.trainBonus;
        color = "red";
        speed = genTime * .25;
        cost = trainCost;
        carbonEmission = 0.03;
      } // Daily cost of car MSPR, insurance and fuel cost
      else if (distance >= 500 && traveler.budget > carCost) {
        traveler.travelDesire += traveler.carBonus;
        color = "green";
        speed = genTime * .25;
        cost = carCost;
        if (history.stations.car == 1) {
          carbonEmission = 0.1;
        } else if (history.stations.car == 2) {
          carbonEmission = 0.03;
        }
      }
    }
    // if a train is not available but a bike is available
    else if (
      history.stations[i].train === 0 &&
      history.stations[i].bike === 1
    ) {
      if (distance < 100) {
        traveler.travelDesire = traveler.travelDesire;
      } else if (distance < 250 && traveler.budget > 3) {
        traveler.travelDesire += traveler.bikeBonus;
        color = "blue";
        speed = genTime * .5;
        carbonEmission = 0.03;
      } else if (distance >= 500 && traveler.budget > 9 + 3 + 5) {
        traveler.travelDesire += traveler.carBonus;
        color = "green";
        speed = genTime * .25;
        if (history.stations.car == 1) {
          carbonEmission = 0.1;
        } else if (history.stations.car == 2) {
          carbonEmission = 0.03;
        }
      }
    }
    // if neither a train nor a bike is available
    else {
      if (distance < 100) {
        traveler.travelDesire = traveler.travelDesire;
      } else if (distance >= 500 && traveler.budget > 9 + 3 + 5) {
        traveler.travelDesire += traveler.carBonus;
        color = "green";
        speed = genTime * .25;
        if (history.stations.car == 1) {
          carbonEmission = 0.1;
        } else if (history.stations.car == 2) {
          carbonEmission = 0.03;
        }
      }
    }
  }

  if (traveler.travelDesire > distance / 1000) {
    //animate movement
    d3.select('#mainSimulation')
      .select('g')
      .append('circle')
      .attr('cx', fromStation.x)
      .attr('cy', fromStation.y)
      .attr('r', 0)
      .attr('fill', color)
      .transition()
      .attr('r', 5)
      .transition()
      .duration(speed * .2)
      .attr('cx', findMidPoint(fromStation, toStation).x)
      .transition()
      .duration(speed * .4)
      .attr('cy', toStation.y)
      .transition()
      .duration(speed * .4)
      .attr('cx', toStation.x)
      .transition()
      .duration(speed * .2)
      .attr('r', 0)
      .remove();

    //recolor stations
    d3.select('#mainSimulation')
      .selectAll('.stations')
      .transition()
      .duration(genTime)
      .attr('fill', d => d3.interpolateRdYlBu(d.popularity));

    stationUpdate(fromStation, toStation);
    passengerUpdate(traveler, color, carbonEmission);
    linkUpdate(fromStation, toStation, traveler);

    traveler.subsidizedMoney +=
      discountBikeFare + discountTrainFare + discountPatrol + subsidizeCarprice;

    return traveler;
  } else {
    // If the traveler did not travel, the satisfaction goes down
    traveler.satisfaction -= 0.2;
    if (traveler.satisfaction < 0) {
      traveler.satisfaction = 0;
    }

    return traveler;
  }
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Here is a historical dataset that includes passengers' satisfaction, and the latest data of passengers, stations and links.`
)});
  main.variable(observer("history")).define("history", function()
{
  return {
    satisfaction: [],
    passengers: [],
    stations: [],
    links: [],
    traffic: [],
    noise: [],
    co2: [],
    subsidy: [],
    upgradeNumber: [],
    finance: []
  };
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Satisfaction Over Time
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Now, you get average satisfaction data of passengers who have move in the simulation. Their satisfaction would  increase when their travel desire weighs more than a distance that they wanted to travel. On the other hand, when the distance was too far, they would give up moving and the satisfaction would drop.

The dgree of satisfaction dropping is more than that of increasing because I assume that nowadays, people take it granted that they can move easily and smoothly in a city.`
)});
  main.variable(observer("lineChart")).define("lineChart", ["d3","simulationSteps","margin","width","height","backgroundColor","history","walkColor","bikeColor","trainColor","carColor"], function(d3,simulationSteps,margin,width,height,backgroundColor,history,walkColor,bikeColor,trainColor,carColor)
{
  let xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, width - margin]);

  let yScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([margin, height - margin]);

  let lineGen = d3
    .line()
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.averageSatisfaction));

  let walkLineGen = d3
    .line()
    .defined(d => d.walkAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.walkAverageSat));

  let bikeLineGen = d3
    .line()
    .defined(d => d.bikeAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.bikeAverageSat));

  let trainLineGen = d3
    .line()
    .defined(d => d.trainAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.trainAverageSat));

  let carLineGen = d3
    .line()
    .defined(d => d.carAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.carAverageSat));

  let svg = d3
    .create('svg')
    .attr("width", width)
    .attr('height', height)
    .attr('id', 'lineChart');

  let bg = svg
    .append('rect')
    .attr("width", width)
    .attr('height', height)
    .attr('fill', backgroundColor);

  svg
    .datum(history.satisfaction)
    .append('path')
    .attr('d', lineGen)
    .attr('id', 'avgPath')
    .attr('stroke', '#fff')
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  svg
    .datum(history.satisfaction)
    .append('path')
    .attr('d', walkLineGen)
    .attr('id', 'walkAvgPath')
    .attr('stroke', walkColor)
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  svg
    .datum(history.satisfaction)
    .append('path')
    .attr('d', bikeLineGen)
    .attr('id', 'bikeAvgPath')
    .attr('stroke', bikeColor)
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  svg
    .datum(history.satisfaction)
    .append('path')
    .attr('d', trainLineGen)
    .attr('id', 'trainAvgPath')
    .attr('stroke', trainColor)
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  svg
    .datum(history.satisfaction)
    .append('path')
    .attr('d', carLineGen)
    .attr('id', 'carAvgPath')
    .attr('stroke', carColor)
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  // Draw the axis
  let yAxis = svg
    .append("g")
    .attr("transform", "translate(" + margin + ",0)")
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text').style("fill", "white");
  yAxis.selectAll('line').style("stroke", "white");
  yAxis.selectAll('path').style("stroke", "white");

  // Draw the axis
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + (height - margin) + ")")
    .call(d3.axisBottom(xScale));

  xAxis.selectAll('text').style("fill", "white");
  xAxis.selectAll('line').style("stroke", "white");
  xAxis.selectAll('path').style("stroke", "white");

  // keys
  const keys = [
    { name: 'TTL Ave', color: 'white' },
    { name: 'Ave by walk', color: walkColor },
    { name: 'Ave by train', color: trainColor },
    { name: 'Ave by car', color: carColor },
    { name: 'Ave by bike', color: bikeColor }
  ];

  const textSize = 12;

  svg
    .selectAll('.keyName')
    .data(keys)
    .enter()
    .append('text')
    .attr('x', margin * 2)
    .attr('y', (d, i) => ((i + 1) / (keys.length + 1)) * margin * 2 + margin)
    .attr('font-family', 'courier')
    .attr('font-size', textSize)
    .attr('fill', 'white')
    .text(d => d.name)
    .attr('class', 'keyName');

  svg
    .selectAll('.keyLine')
    .data(keys)
    .enter()
    .append('line')
    .attr('x1', margin * 2 - 20)
    .attr(
      'y1',
      (d, i) =>
        ((i + 1) / (keys.length + 1)) * margin * 2 + margin - textSize / 4
    )
    .attr('x2', margin * 2 - 5)
    .attr(
      'y2',
      (d, i) =>
        ((i + 1) / (keys.length + 1)) * margin * 2 + margin - textSize / 4
    )
    .attr('stroke-width', 3)
    .attr('stroke', d => d.color);

  return svg.node();
}
);
  main.variable(observer("updateLineChart")).define("updateLineChart", ["d3","simulationSteps","margin","width","height","history"], function(d3,simulationSteps,margin,width,height,history){return(
function updateLineChart(gen) {
  if (gen == 0) {
    d3.selectAll('path').remove;
  }

  let xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, width - margin]);

  let yScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([margin, height - margin]);

  let lineGen = d3
    .line()
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.averageSatisfaction));

  let walkLineGen = d3
    .line()
    .defined(d => d.walkAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.walkAverageSat));

  let bikeLineGen = d3
    .line()
    .defined(d => d.bikeAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.bikeAverageSat));

  let trainLineGen = d3
    .line()
    .defined(d => d.trainAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.trainAverageSat));

  let carLineGen = d3
    .line()
    .defined(d => d.carAverageSat !== undefined)
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.carAverageSat));

  history.satisfaction.forEach(
    d => (
      (d.averageSatisfaction = d3.mean(d.passengerSatisfaction, e => e)),
      (d.walkAverageSat = d3.mean(d.walkSatisfaction, e => e)),
      (d.bikeAverageSat = d3.mean(d.bikeSatisfaction, e => e)),
      (d.trainAverageSat = d3.mean(d.trainSatisfaction, e => e)),
      (d.carAverageSat = d3.mean(d.carSatisfaction, e => e))
    )
  );

  d3.select('#lineChart')
    .select("#avgPath")
    .datum(history.satisfaction)
    .transition()
    .attr('d', lineGen);

  d3.select('#lineChart')
    .select("#walkAvgPath")
    .datum(history.satisfaction)
    .transition()
    .attr('d', walkLineGen);

  d3.select('#lineChart')
    .select("#bikeAvgPath")
    .datum(history.satisfaction)
    .transition()
    .attr('d', bikeLineGen);

  d3.select('#lineChart')
    .select("#trainAvgPath")
    .datum(history.satisfaction)
    .transition()
    .attr('d', trainLineGen);

  d3.select('#lineChart')
    .select("#carAvgPath")
    .datum(history.satisfaction)
    .transition()
    .attr('d', carLineGen);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Interaction#1 How to increase passengers' satisfaction?

From this part, you can explore and experiment how to increase passenger's satisfaction by intervening city infrastructures, or their decision making.
`
)});
  main.variable(observer("viewof cityBudget")).define("viewof cityBudget", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 5,
  value: 10,
  title: "City Budeget Setting (million$)",
  description: "How much transportation budget do you set?"
})
)});
  main.variable(observer("cityBudget")).define("cityBudget", ["Generators", "viewof cityBudget"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`### Investment on infrastructures

You can increase the number of stations to shorten a travel distance. Or investing money to stations to keep providing fast and reasonable transportation options such as bike or train. `
)});
  main.variable(observer("viewof addStationCount")).define("viewof addStationCount", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 5,
  value: 0,
  title: "Additional Stations"
})
)});
  main.variable(observer("addStationCount")).define("addStationCount", ["Generators", "viewof addStationCount"], (G, _) => G.input(_));
  main.variable(observer("viewof increaseCapacity")).define("viewof increaseCapacity", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  title: "Increase capacity of stations (%)",
  description: "You can improve conjestion when stations get popular"
})
)});
  main.variable(observer("increaseCapacity")).define("increaseCapacity", ["Generators", "viewof increaseCapacity"], (G, _) => G.input(_));
  main.variable(observer("viewof upgradePercentage")).define("viewof upgradePercentage", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  title: "Upgrade facilitaion in unpopular stations (%)",
  description: "You can increase transit modes in unpopular station"
})
)});
  main.variable(observer("upgradePercentage")).define("upgradePercentage", ["Generators", "viewof upgradePercentage"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`### Incentives for passengers

You can give incentives that help the passengers use faster transit methods which enable them to go far destinations.`
)});
  main.variable(observer("viewof subsidizeCarprice")).define("viewof subsidizeCarprice", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 25000,
  step: 500,
  value: 0,
  title: "Subsidy for buying a car ($)",
  description: "How much money do you financially support people to buy a car?"
})
)});
  main.variable(observer("subsidizeCarprice")).define("subsidizeCarprice", ["Generators", "viewof subsidizeCarprice"], (G, _) => G.input(_));
  main.variable(observer("viewof discountPatrol")).define("viewof discountPatrol", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 3,
  step: 0.01,
  value: 0,
  title: "Discount on patrol price ($)"
})
)});
  main.variable(observer("discountPatrol")).define("discountPatrol", ["Generators", "viewof discountPatrol"], (G, _) => G.input(_));
  main.variable(observer("viewof discountTrainFare")).define("viewof discountTrainFare", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 3,
  step: 0.01,
  value: 0,
  title: "Discount on train fare ($)"
})
)});
  main.variable(observer("discountTrainFare")).define("discountTrainFare", ["Generators", "viewof discountTrainFare"], (G, _) => G.input(_));
  main.variable(observer("viewof discountBikeFare")).define("viewof discountBikeFare", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 3,
  step: 0.01,
  value: 0,
  title: "Discount on sharing bike fare ($)"
})
)});
  main.variable(observer("discountBikeFare")).define("discountBikeFare", ["Generators", "viewof discountBikeFare"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`### Budget Monitor

The chart show how much expenditure is spent in each simulation step, and how much budget is left.`
)});
  main.variable(observer()).define(["d3","simulationSteps","margin","backgroundColor","history"], function(d3,simulationSteps,margin,backgroundColor,history)
{
  const bWidth = 800;
  const bHeight = 400;

  const xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, bWidth - margin]);

  const yScale = d3
    .scaleLinear()
    .domain([300, -800])
    .range([margin, bHeight - margin]);

  const svg = d3
    .create('svg')
    .attr("width", bWidth)
    .attr('height', bHeight)
    .attr('id', 'budgetChart');

  const bg = svg
    .append('rect')
    .attr("width", bWidth)
    .attr('height', bHeight)
    .attr('fill', backgroundColor);

  let lineGen = d3
    .line()
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.budgetBalance));

  svg
    .datum(history.finance)
    .append('path')
    .attr('d', lineGen)
    .attr('id', 'budgetBalancePath')
    .attr('stroke', 'yellow')
    .attr('stroke-width', '3')
    .attr('fill', 'none');

  // Draw the axis
  let yAxis = svg
    .append("g")
    .attr("transform", "translate(" + margin + ",0)")
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text').style("fill", "white");
  yAxis.selectAll('line').style("stroke", "white");
  yAxis.selectAll('path').style("stroke", "white");

  // Draw the axis
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + bHeight / 2 + ")")
    .call(d3.axisBottom(xScale));

  xAxis.selectAll('text').style("fill", "white");
  xAxis.selectAll('line').style("stroke", "white");
  xAxis.selectAll('path').style("stroke", "white");

  return svg.node();
}
);
  main.variable(observer("financeBalance")).define("financeBalance", ["d3","addStationCount","increaseCapacity","history","replaceEv","upgradePercentage","cityBudget","simulationSteps","margin"], function(d3,addStationCount,increaseCapacity,history,replaceEv,upgradePercentage,cityBudget,simulationSteps,margin){return(
function(gen) {
  if (gen == 0) {
    d3.selectAll('rect').remove;
    d3.selectAll('variableCost').remove;
  }

  // fixed cost
  let stationCost = addStationCount * 1;
  let capacityCost = increaseCapacity * 0.1 * history.stations.length;
  let evCost = replaceEv * 0.05;
  let fixedCost = stationCost + capacityCost + evCost;

  // station upgrade cost
  let initialValue = 0;
  history.upgradeNumber.forEach(
    d =>
      (d.upgradeTotal = d.upgradeNumber.reduce((totalValue, currentValue) => {
        return totalValue + currentValue;
      }, initialValue))
  );
  let upgradeCost = upgradePercentage * 0.1;

  // subsidy cost
  let initialCost = 0;
  history.subsidy.forEach(
    d =>
      (d.sum = d.subsidizedMoney
        .reduce((totalCost, currentCost) => {
          return totalCost + currentCost;
        }, initialCost)
        .toFixed(2))
  );

  // total variable cost
  let variableCost =
    upgradeCost * history.upgradeNumber[gen].upgradeTotal +
    history.subsidy[gen].sum;

  history.finance[gen].fixedCost = fixedCost;
  history.finance[gen].totalVariableCost = parseFloat(variableCost);

  if (gen >= 1) {
    history.finance[gen].variableCost =
      history.finance[gen].totalVariableCost -
      history.finance[gen - 1].totalVariableCost;
  } else if (gen == 0) {
    history.finance[gen].variableCost = history.finance[gen].totalVariableCost;
  }

  // calculate budget balance
  history.finance[gen].budgetBalance =
    cityBudget * 100 - fixedCost - history.finance[gen].totalVariableCost;

  const bWidth = 800;
  const bHeight = 400;

  const xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, bWidth - margin]);

  const yScale = d3
    .scaleLinear()
    .domain([300, -300])
    .range([margin, bHeight - margin]);

  let lineGen = d3
    .line()
    .x(d => xScale(d.generationNumber))
    .y(d => yScale(d.budgetBalance));

  d3.select('#budgetChart')
    .append('rect')
    .attr('x', margin)
    .attr('y', bHeight / 2 - yScale(cityBudget))
    .attr('width', (bWidth - margin) / simulationSteps)
    .attr('height', yScale(cityBudget))
    .attr('fill', 'red');

  d3.select('#budgetChart')
    .append('rect')
    .attr('x', margin)
    .attr('y', bHeight / 2 + history.finance[0].totalVariableCost)
    .attr('width', (bWidth - margin) / simulationSteps)
    .attr('height', -yScale(fixedCost))
    .attr('fill', 'green');

  d3.select('#budgetChart')
    .selectAll('.variableCost')
    .data(history.finance)
    .enter()
    .append('rect')
    .attr('x', (d, i) => margin + (i * (bWidth - margin)) / simulationSteps)
    .attr('y', bHeight / 2)
    .attr('width', (bWidth - margin) / simulationSteps)
    .attr('height', d => yScale(d.variableCost))
    .attr('fill', 'blue')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('class', 'variableCost');

  d3.select('#budgetChart')
    .select("#budgetBalancePath")
    .datum(history.finance)
    .transition()
    .attr('d', lineGen);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`You finished the additional setting. Let's see a resimulated result.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Interaction#2 How to balance between satisfaction and sustainability?
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`In this part, you can incorporate major side effects caused by transit, traffic jam, noise and carbon emmision.`
)});
  main.variable(observer("viewof sideEffect")).define("viewof sideEffect", ["checkbox"], function(checkbox){return(
checkbox({
  title: "Side effect of transit",
  description: "Please select which side effect you want to incorporate",
  options: [
    { value: "traffic", label: "Traffic Jam" },
    { value: "noise", label: "Noise" },
    { value: "co2", label: "Carbon Emission" }
  ]
})
)});
  main.variable(observer("sideEffect")).define("sideEffect", ["Generators", "viewof sideEffect"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`### Side Effect monitor

You can see how side effects that you choose in the check box would change in the simulation.`
)});
  main.variable(observer()).define(["d3","simulationSteps","margin","width","height","backgroundColor","sideEffects","history"], function(d3,simulationSteps,margin,width,height,backgroundColor,sideEffects,history)
{
  let xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, width - margin]);

  let yScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([margin, height - margin]);

  let svg = d3
    .create('svg')
    .attr("width", width)
    .attr('height', height)
    .attr('id', 'monitor');

  let bg = svg
    .append('rect')
    .attr("width", width)
    .attr('height', height)
    .attr('fill', backgroundColor);

  if (sideEffects.traffic == true) {
    let trafficLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.averageTraffic));
    svg
      .datum(history.traffic)
      .append('path')
      .attr('d', trafficLineGen)
      .attr('id', 'traAvgPath')
      .attr('stroke', '#fff')
      .attr('stroke-width', '3')
      .attr('fill', 'none');
  }

  if (sideEffects.noise == true) {
    let noiseLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.averageNoise));
    svg
      .datum(history.noise)
      .append('path')
      .attr('d', noiseLineGen)
      .attr('id', 'noiseAvgPath')
      .attr('stroke', '#024')
      .attr('stroke-width', '3')
      .attr('fill', 'none');
  }

  if (sideEffects.carbon == true) {
    let ceLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.aveCarbonEmission));

    svg
      .datum(history.co2)
      .append('path')
      .attr('d', ceLineGen)
      .attr('id', 'ceAvgPath')
      .attr('stroke', '#f24')
      .attr('stroke-width', '3')
      .attr('fill', 'none');
  }

  // Draw the axis
  let yAxis = svg
    .append("g")
    .attr("transform", "translate(" + margin + ",0)")
    .call(d3.axisLeft(yScale));

  yAxis.selectAll('text').style("fill", "white");
  yAxis.selectAll('line').style("stroke", "white");
  yAxis.selectAll('path').style("stroke", "white");

  // Draw the axis
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + (height - margin) + ")")
    .call(d3.axisBottom(xScale));

  xAxis.selectAll('text').style("fill", "white");
  xAxis.selectAll('line').style("stroke", "white");
  xAxis.selectAll('path').style("stroke", "white");

  // keys
  const keys = [
    { name: 'Traffic per Road', color: 'white' },
    { name: 'Noise per Road', color: '#024' },
    { name: 'Carbon Emission per Passenger', color: '#f24' }
  ];

  const textSize = 12;

  svg
    .selectAll('.keyName')
    .data(keys)
    .enter()
    .append('text')
    .attr('x', margin * 2)
    .attr('y', (d, i) => ((i + 1) / (keys.length + 1)) * margin * 2 + margin)
    .attr('font-family', 'courier')
    .attr('font-size', textSize)
    .attr('fill', 'white')
    .text(d => d.name)
    .attr('class', 'keyName');

  svg
    .selectAll('.keyLine')
    .data(keys)
    .enter()
    .append('line')
    .attr('x1', margin * 2 - 20)
    .attr(
      'y1',
      (d, i) =>
        ((i + 1) / (keys.length + 1)) * margin * 2 + margin - textSize / 4
    )
    .attr('x2', margin * 2 - 5)
    .attr(
      'y2',
      (d, i) =>
        ((i + 1) / (keys.length + 1)) * margin * 2 + margin - textSize / 4
    )
    .attr('stroke-width', 3)
    .attr('stroke', d => d.color);

  return svg.node();
}
);
  main.variable(observer("updateSideEffectMonitor")).define("updateSideEffectMonitor", ["d3","simulationSteps","margin","width","height","history","sideEffects"], function(d3,simulationSteps,margin,width,height,history,sideEffects){return(
function updateSideEffectMonitor(gen) {
  if (gen == 0) {
    d3.selectAll('path').remove;
  }

  let xScale = d3
    .scaleLinear()
    .domain([0, simulationSteps - 1])
    .range([margin, width - margin]);

  let yScale = d3
    .scaleLinear()
    .domain([1, 0])
    .range([margin, height - margin]);

  history.traffic.forEach(
    d => (d.averageTraffic = d3.mean(d.roadTraffic, e => e))
  );
  history.noise.forEach(d => (d.averageNoise = d3.mean(d.roadNoise, e => e)));

  history.co2.forEach(
    d => (d.aveCarbonEmission = d3.mean(d.carbonEmission, e => e))
  );

  if (sideEffects.traffic == true) {
    let trafficLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.averageTraffic));

    d3.select('#monitor')
      .select("#traAvgPath")
      .datum(history.traffic)
      .transition()
      .attr('d', trafficLineGen);
  }
  if (sideEffects.noise == true) {
    let noiseLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.averageNoise));

    d3.select('#monitor')
      .select("#noiseAvgPath")
      .datum(history.noise)
      .transition()
      .attr('d', noiseLineGen);
  }
  if (sideEffects.carbon == true) {
    let ceLineGen = d3
      .line()
      .x(d => xScale(d.generationNumber))
      .y(d => yScale(d.aveCarbonEmission));

    d3.select('#monitor')
      .select("#ceAvgPath")
      .datum(history.co2)
      .transition()
      .attr('d', ceLineGen);
  }
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Investment on infrastructures

You can invest additional money in the infrastructure to mitigate traffic jam, noise and carbon emission.`
)});
  main.variable(observer("viewof increaseLinksCap")).define("viewof increaseLinksCap", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 5,
  value: 0,
  title: "Increase capacity of links (%)",
  description: "You can improve conjestion on links"
})
)});
  main.variable(observer("increaseLinksCap")).define("increaseLinksCap", ["Generators", "viewof increaseLinksCap"], (G, _) => G.input(_));
  main.variable(observer("viewof decreaseNoise")).define("viewof decreaseNoise", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  title: "Decrease noise of links (%)",
  description: "You can improve noise on links"
})
)});
  main.variable(observer("decreaseNoise")).define("decreaseNoise", ["Generators", "viewof decreaseNoise"], (G, _) => G.input(_));
  main.variable(observer("viewof evRatio")).define("viewof evRatio", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  title: "Replacement of petrol cars with electric one (%)",
  description:
    "You can reduce carbon emission by increasing more environmetal-friendly car at each station"
})
)});
  main.variable(observer("evRatio")).define("evRatio", ["Generators", "viewof evRatio"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`### Incentives for passengers

Or give other incentives to encourage people to use other transit methods that emit less carbon emissions`
)});
  main.variable(observer("viewof increasePatrol")).define("viewof increasePatrol", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 10,
  step: 0.01,
  value: 0,
  title: "Increase costs on patrol price ($)",
  description: "You can prevent passengers from riding patrol cars"
})
)});
  main.variable(observer("increasePatrol")).define("increasePatrol", ["Generators", "viewof increasePatrol"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`You finished the additional setting. Let's see a resimulated result.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Mathematical Utilities

`
)});
  main.variable(observer("weight")).define("weight", function(){return(
function(arr) {
  return [].concat(
    ...arr.map(obj => Array(Math.ceil(obj.popularity * 100)).fill(obj))
  );
}
)});
  main.variable(observer("pick")).define("pick", ["weight"], function(weight){return(
function(arr) {
  let weighted = weight(arr);
  return weighted[Math.floor(Math.random() * weighted.length)];
}
)});
  main.variable(observer("getDistance")).define("getDistance", function(){return(
function(x1, y1, x2, y2) {
  let xs = Math.abs(x2 - x1),
    ys = Math.abs(y2 - y1);

  return xs + ys;
}
)});
  main.variable(observer("findMidPoint")).define("findMidPoint", function(){return(
function(station1, station2) {
  return { x: (station1.x + station2.x) / 2, y: (station1.y + station2.y) / 2 };
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Initial Functions

Used to (re)create all elements in the simulation.
`
)});
  main.variable(observer("createStations")).define("createStations", ["stationCount","addStationCount","width","gridResolution","height","stationNames","history"], function(stationCount,addStationCount,width,gridResolution,height,stationNames,history){return(
function() {
  for (let i = 0; i < stationCount + addStationCount; i++) {
    let stationObject = {
      // gridResolution is width of each grid
      // width / gridResolution shows which grid number a station is located
      // .5 * gridResolution is to shift a whole grid from the edges
      x:
        Math.floor(Math.random() * (width / gridResolution)) * gridResolution +
        .5 * gridResolution,
      y:
        Math.floor(Math.random() * (height / gridResolution)) * gridResolution +
        .5 * gridResolution,
      popularity: Math.random(),
      name: stationNames[Math.floor(Math.random() * stationNames.length)],
      upgraded: 0
    };

    // Allocate transportation methods based on popularity
    if (stationObject.popularity >= 0.7) {
      stationObject.car = 1;
      stationObject.train = 1;
      stationObject.bike = 1;
    } else if (stationObject.popularity < 0.7) {
      stationObject.car = 1;
      stationObject.train = 0;
      stationObject.bike = 1;
    } else if (stationObject.popularity < 0.3) {
      stationObject.car = 1;
      stationObject.train = 0;
      stationObject.bike = 0;
    }
    history.stations.push(stationObject);
  }
  return "Stations created!";
}
)});
  main.variable(observer("createLinks")).define("createLinks", ["history","increaseLinksCap","decreaseNoise"], function(history,increaseLinksCap,decreaseNoise){return(
function() {
  const blankStation = {
    x: 0,
    y: 0
  };

  for (let i = 0; i < history.stations.length - 1; i++) {
    for (let j = i + 1; j < history.stations.length; j++) {
      let linkObject = {
        stops: [history.stations[i], history.stations[j]],
        visualCoord: [
          history.stations[i],
          history.stations[j]
        ],
        trainVisualCoord: [blankStation, blankStation],
        bikeVisualCoord: [blankStation, blankStation],

        // Attributes of side effects of transit
        traffic: 0 * (1 - increaseLinksCap),
        noise: 0 * (1 - decreaseNoise)
      };

      if (
        history.stations[i].popularity >= 0.7 &&
        history.stations[j].popularity >= 0.7
      ) {
        linkObject.trainVisualCoord = [
          history.stations[i],
          history.stations[j]
        ];
        linkObject.bikeVisualCoord = [
          history.stations[i],
          history.stations[j]
        ];
      } else if (
        history.stations[i].popularity < 0.7 &&
        history.stations[j].popularity < 0.7
      ) {
        linkObject.bikeVisualCoord = [
          history.stations[i],
          history.stations[j]
        ];
      }
      history.links.push(linkObject);
    }
  }
  return "links created";
}
)});
  main.variable(observer("createPassengers")).define("createPassengers", ["passengerCount","history"], function(passengerCount,history){return(
function() {
  for (let i = 0; i < passengerCount; i++) {
    history.passengers.push({
      travelDesire: Math.random(),
      budget: Math.random() * 20,
      satisfaction: 0,
      carBonus: Math.random(),
      trainBonus: Math.random(),
      bikeBonus: Math.random(),
      lastMode: "",
      carbonEmission: 0,
      subsidizedMoney: 0
    });
  }
  return "Passengers Created!";
}
)});
  main.variable(observer("createWorld")).define("createWorld", ["d3","transitThickness","transitOffset","scaleFactor","width","height","walkColor","trainColor","carColor","bikeColor","history","stationSize","backgroundColor"], function(d3,transitThickness,transitOffset,scaleFactor,width,height,walkColor,trainColor,carColor,bikeColor,history,stationSize,backgroundColor){return(
async function () {
  let svg = d3.select("#mainSimulation");

  let lineGenerator = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveStep);

  let trainLineGenerator = d3
    .line()
    .x((d) => d.x + transitThickness * transitOffset)
    .y((d) => d.y + transitThickness * transitOffset)
    .curve(d3.curveStep);

  let bikeLineGenerator = d3
    .line()
    .x((d) => d.x - transitThickness * transitOffset)
    .y((d) => d.y - transitThickness * transitOffset)
    .curve(d3.curveStep);

  let carLineGenerator = d3
    .line()
    .x((d) => d.x + transitThickness * (transitOffset * 2))
    .y((d) => d.y + transitThickness * (transitOffset * 2))
    .curve(d3.curveStep);

  let scaleXCenter = (1 - scaleFactor) * (width / 2);
  let scaleYCenter = (1 - scaleFactor) * (height / 2);

  let g = svg
    .append("g")
    .attr("id", "transitMapGroup")
    .attr(
      "transform",
      "translate(" +
        scaleXCenter +
        "," +
        scaleYCenter +
        ") scale(" +
        scaleFactor +
        ")"
    );

  // keys
  const keys = [
    { name: "Sidewalk", color: walkColor },
    { name: "Train Line", color: trainColor },
    { name: "Road", color: carColor },
    { name: "Bike Lane", color: bikeColor }
  ];

  svg
    .selectAll(".keyName")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", (d, i) => ((i + 1) / (keys.length + 1)) * width)
    .attr("y", 20)
    .attr("font-family", "courier")
    .attr("font-size", 12)
    .attr("fill", "white")
    .text((d) => d.name)
    .attr("class", "keyName");

  svg
    .selectAll(".keyLine")
    .data(keys)
    .enter()
    .append("line")
    .attr("x1", (d, i) => ((i + 1) / (keys.length + 1)) * width - 25)
    .attr("y1", 15)
    .attr("x2", (d, i) => ((i + 1) / (keys.length + 1)) * width - 5)
    .attr("y2", 15)
    .attr("stroke-width", 3)
    .attr("stroke", (d) => d.color);

  //sidewalks
  let sideWalk = g
    .selectAll(".links")
    .interrupt()
    .data(history.links)
    .enter()
    .append("path")
    .attr("d", (d) => {
      //pathString converts line logic into SVG path directions
      //https://github.com/d3/d3-shape
      return lineGenerator(d.visualCoord);
    })
    .attr("stroke", walkColor)
    .attr("stroke-width", transitThickness)
    .attr("opacity", 0.5)
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke-miterlimit", 1)
    .attr("stroke-dasharray", "0,1");

  // animate line drawing
  // https://observablehq.com/@d3/learn-d3-animation

  await sideWalk
    .transition()
    .ease(d3.easeSin)
    .duration(1500)
    .attrTween("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return d3.interpolate(`0,${length}`, `${length},${length}`);
    })
    .end();

  let trainLink = g
    .selectAll(".trainLinks")
    .interrupt()
    .data(history.links)
    .enter()
    .append("path")
    .attr("d", (d) => {
      return trainLineGenerator(d.trainVisualCoord);
    })
    .attr("stroke", trainColor)
    .attr("stroke-width", transitThickness)
    .attr("opacity", 0.5)
    .attr("class", "trainLinks")
    .attr("fill", "none");

  await trainLink
    .transition()
    .duration(1500)
    .ease(d3.easeSin)
    .attrTween("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return d3.interpolate(`0,${length}`, `${length},${length}`);
    })
    .end();

  let bikeLink = g
    .selectAll(".bikeLinks")
    .interrupt()
    .data(history.links)
    .enter()
    .append("path")
    .attr("d", (d) => {
      return bikeLineGenerator(d.bikeVisualCoord);
    })
    .attr("stroke", bikeColor)
    .attr("stroke-width", transitThickness)
    .attr("opacity", 0.5)
    .attr("class", "bikeLinks")
    .attr("fill", "none");

  await bikeLink
    .transition()
    .duration(1500)
    .ease(d3.easeSin)
    .attrTween("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return d3.interpolate(`0,${length}`, `${length},${length}`);
    })
    .end();

  let carLink = g
    .selectAll(".carLinks")
    .interrupt()
    .data(history.links)
    .enter()
    .append("path")
    .attr("d", (d) => {
      return carLineGenerator(d.visualCoord);
    })
    .attr("stroke", carColor)
    .attr("stroke-width", transitThickness)
    .attr("opacity", 0.5)
    .attr("class", "carLinks")
    .attr("fill", "none");

  let carLinkLength = carLink.node().getTotalLength();

  await carLink
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attrTween("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return d3.interpolate(`0,${length}`, `${length},${length}`);
    })
    .end();

  //draw city shapes
  await g
    .selectAll(".stations")
    .data(history.stations)
    .enter()
    .append("rect")
    .attr("x", (d) => d.x - stationSize / 2)
    .attr("y", (d) => d.y - stationSize / 2)
    .transition()
    .duration(250)
    .delay((d) => Math.random() * history.stations.length * 100)
    .attr("width", stationSize + 10)
    .attr("height", stationSize + 10)
    .attr("fill", (d) => d3.interpolateRdYlBu(d.popularity))
    .attr("opacity", 1)
    .transition()
    .duration(500)
    .attr("width", stationSize)
    .attr("height", stationSize)
    .attr("stroke", "white")
    .attr("stroke-width", transitThickness)
    .attr("class", "stations")
    .end();

  //draw background for station names
  await g
    .selectAll(".stationBackgrounds")
    .data(history.stations)
    .enter()
    .append("rect")
    .attr("x", (d) => d.x + stationSize / 2)
    .attr("y", (d) => d.y - stationSize / 2)
    .transition()
    .duration(500)
    .attr("width", 50)
    .attr("height", stationSize)
    .attr("fill", "white")
    .attr("font-family", "helvetica")
    .attr("opacity", 1)
    .attr("stroke", "white")
    .attr("stroke-width", transitThickness)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .attr("font-size", 10)
    .attr("class", "stationBackgrounds")
    .end();

  // put station names
  return g
    .selectAll(".stationLabels")
    .data(history.stations)
    .enter()
    .append("text")
    .attr("x", (d) => d.x + stationSize * 0.5)
    .attr("y", (d) => d.y)
    .transition()
    .duration(500)
    .text((d) => d.name.substring(0, 6))
    .attr("fill", backgroundColor)
    .attr("font-family", "courier")
    .attr("opacity", 1)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .attr("font-size", 12)
    .attr("class", "stationLabels")
    .end();
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Update Functions

Used to repeatedly keep visualization elements up to date with the simulation.
`
)});
  main.variable(observer("stationUpdate")).define("stationUpdate", ["history","upgradePercentage","increaseCapacity"], function(history,upgradePercentage,increaseCapacity){return(
function(from, to) {
  let upgradeCount = 0;
  history.stations.forEach(station => {
    station.popularity -= 0.01;
    if (station.popularity < 0.2) {
      station.popularity += 0.5 * (upgradePercentage / 100);
      station.upgraded++;
    }
  });

  from.popularity += 0.2;
  to.popularity += 0.2;

  if (from.popularity > 0.85 * (1 + increaseCapacity / 100)) {
    from.popularity = 0.5;
  } else if (to.popularity > 0.85 * (1 + increaseCapacity / 100)) {
    to.popularity = 0.5;
  }

  // Reallocate transportation methods based on the latest popularity
  for (let station of history.stations) {
    if (station.popularity >= 0.5) {
      station.car = 1;
      station.train = 1;
      station.bike = 1;
    } else if (station.popularity < 0.5) {
      station.car = 1;
      station.train = 0;
      station.bike = 1;
    } else if (station.popularity < 0.3) {
      station.car = 1;
      station.train = 0;
      station.bike = 0;
    }
  }
}
)});
  main.variable(observer("passengerUpdate")).define("passengerUpdate", function(){return(
function(traveler, color, carbonEmission) {
  // increase satisfaction
  traveler.satisfaction += 0.05;
  // increase a cumulative sum of carbon emmision
  traveler.carbonEmission += carbonEmission;
  // reset the budget
  traveler.budget = Math.random() * 20;
  // reset travel desire
  traveler.travelDesire = Math.random();

  if (traveler.satisfaction > 1) {
    traveler.satisfaction = 1;
  }

  if (color === "white") {
    traveler.lastMode = "walk";
  } else if (color === "blue") {
    traveler.lastMode = "bike";
  } else if (color === "red") {
    traveler.lastMode = "train";
  } else {
    traveler.lastMode = "car";
  }
}
)});
  main.variable(observer("linkUpdate")).define("linkUpdate", ["history"], function(history){return(
function(from, to, traveler) {
  history.links.forEach(d => {
    if (
      (from.x === d.stops[0].x &&
        from.y === d.stops[0].y &&
        to.x === d.stops[1].x &&
        to.y === d.stops[1].y) ||
      (from.x === d.stops[1].x &&
        from.y === d.stops[1] &&
        to.x === d.stops[0].x &&
        to.y === d.stops[0].y)
    ) {
      d.traffic += 0.1;
    }
  });
  history.links.forEach(d => {
    if (
      (from.x === d.stops[0].x &&
        from.y === d.stops[0].y &&
        to.x === d.stops[1].x &&
        to.y === d.stops[1].y) ||
      (from.x === d.stops[1].x &&
        from.y === d.stops[1] &&
        to.x === d.stops[0].x &&
        to.y === d.stops[0].y)
    ) {
      d.noise += 0.3;
    }
  });
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Visual Setting
`
)});
  main.variable(observer("viewof transitThickness")).define("viewof transitThickness", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 20,
  step: 1,
  value: 2,
  title: "Transit Line Thickness"
})
)});
  main.variable(observer("transitThickness")).define("transitThickness", ["Generators", "viewof transitThickness"], (G, _) => G.input(_));
  main.variable(observer("viewof transitOffset")).define("viewof transitOffset", ["slider"], function(slider){return(
slider({
  min: 0,
  max: 10,
  step: .1,
  value: 1,
  title: "Transit Line Offset"
})
)});
  main.variable(observer("transitOffset")).define("transitOffset", ["Generators", "viewof transitOffset"], (G, _) => G.input(_));
  main.variable(observer("viewof backgroundColor")).define("viewof backgroundColor", ["color"], function(color){return(
color({
  value: "#0d0d0d",
  title: "Background Color"
})
)});
  main.variable(observer("backgroundColor")).define("backgroundColor", ["Generators", "viewof backgroundColor"], (G, _) => G.input(_));
  main.variable(observer("viewof trainColor")).define("viewof trainColor", ["color"], function(color){return(
color({
  value: "#20BF55",
  title: "Train Color"
})
)});
  main.variable(observer("trainColor")).define("trainColor", ["Generators", "viewof trainColor"], (G, _) => G.input(_));
  main.variable(observer("viewof carColor")).define("viewof carColor", ["color"], function(color){return(
color({
  value: "#fe9419",
  title: "Road Color"
})
)});
  main.variable(observer("carColor")).define("carColor", ["Generators", "viewof carColor"], (G, _) => G.input(_));
  main.variable(observer("viewof bikeColor")).define("viewof bikeColor", ["color"], function(color){return(
color({
  value: "#f44c67",
  title: "Bike Color"
})
)});
  main.variable(observer("bikeColor")).define("bikeColor", ["Generators", "viewof bikeColor"], (G, _) => G.input(_));
  main.variable(observer("viewof walkColor")).define("viewof walkColor", ["color"], function(color){return(
color({
  value: "#01BAEF",
  title: "Sidewalk Color"
})
)});
  main.variable(observer("walkColor")).define("walkColor", ["Generators", "viewof walkColor"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`
-----
## Additional Functions
Create additional elements in the simulation.
`
)});
  main.variable(observer("sideEffects")).define("sideEffects", ["sideEffect"], function(sideEffect)
{
  let choices = {};
  sideEffect.indexOf("traffic") != -1
    ? (choices.traffic = true)
    : (choices.traffic = false);
  sideEffect.indexOf("noise") != -1
    ? (choices.noise = true)
    : (choices.noise = false);
  sideEffect.indexOf("co2") != -1
    ? (choices.carbon = true)
    : (choices.carbon = false);

  return choices;
}
);
  main.variable(observer("replaceEv")).define("replaceEv", ["evRatio","history"], function(evRatio,history)
{
  // calculate how many patrol vehicles are replaced with electric ones
  let numberOfEv = Math.floor((evRatio / 100) * history.stations.length);

  for (let i = 0; i < numberOfEv; i++) {
    let evStation =
      history.stations[Math.floor(Math.random() * history.stations.length)];

    evStation.car = 2;
  }

  return numberOfEv;
}
);
  main.variable(observer("upgradeStation")).define("upgradeStation", function()
{
  
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`# Next Steps`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`- Research how much people are affected by traffic jam and noise
- Research how infrastracture costs are calculated
- Consider how lavy affects people's satisfaction
- Explore more visualization patterns
- Incorporate multimordal transit`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## Appendix
`
)});
  main.variable(observer("stationNames")).define("stationNames", function(){return(
[
  "Tyresö",
  "Piura",
  "Newark",
  "Iksha",
  "Minh Long",
  "Bāft",
  "Colonia Catuete",
  "Foúrnoi",
  "Lesnoy",
  "Masḩah",
  "Haolibao",
  "Xiapu",
  "Krzepice",
  "Sungai Raya",
  "Villa Urquiza",
  "Masohi",
  "Sandakan",
  "New York City",
  "Pacho",
  "Jianping",
  "Liucheng",
  "Uppsala",
  "Arnoia",
  "Nice",
  "Cacoal",
  "Barnaul",
  "Nancy",
  "Solidaridad",
  "Madrid",
  "Kungälv",
  "Kristinehamn",
  "Jedlina-Zdrój",
  "Darkūsh",
  "Corcuera",
  "Kusi",
  "Trinity Ville",
  "Albion",
  "Kiukasen",
  "Guagua",
  "Longshan",
  "San Jose",
  "Valladolid",
  "Rousínov",
  "Kocēni",
  "Odienné",
  "Kanash",
  "Yanglin",
  "Padangsidempuan",
  "Frankfort",
  "Ban Rangsit",
  "Alejandro Roca",
  "Falun",
  "Borgustanskaya",
  "Lubaczów",
  "Ōhara",
  "Huanggang",
  "North Little Rock",
  "Zgornje Bitnje",
  "Stockholm",
  "Baryshevo",
  "Norton",
  "Guozhen",
  "Beijie",
  "Ipaba",
  "Staryy Sambor",
  "Wangwu",
  "Karlskoga",
  "Lišov",
  "Enköping",
  "Shanjiang",
  "Babice",
  "Santa Bárbara d'Oeste",
  "Coruripe",
  "Lipljan",
  "Sredniy",
  "Jorong",
  "Fresno",
  "Kemendung",
  "Nanxing",
  "Colorado Springs",
  "Wuluo",
  "Pulong Sampalok",
  "Guogan",
  "Badulla",
  "Natonin",
  "Le Mans",
  "Pacaembu",
  "Skatepark",
  "Dnestrovsc",
  "Ngujung",
  "Rukem",
  "Puncakwangi",
  "Nashtā Rūd",
  "Kimch’aek-si",
  "Masumbwe",
  "Skien",
  "Богданци",
  "Cibingbin",
  "Hexi",
  "Kongjiang",
  "Beidong",
  "Göteborg",
  "Neob",
  "Solnechnoye",
  "Koniaków",
  "Utkivka",
  "Lučko",
  "Gunungjulang",
  "Cruzeiro do Sul",
  "João Pessoa",
  "Saryaghash",
  "Balete",
  "Masjed Soleymān",
  "Tangchijie",
  "Yongfu",
  "Peicheng",
  "Jönköping",
  "Zibreira",
  "Mizdah",
  "Mendefera",
  "Rodez",
  "Ourinhos",
  "Banarankrajan",
  "Rio Branco",
  "Mouzourás",
  "Karangtanjung",
  "Boguszów-Gorce",
  "Tyresö",
  "Wysoka",
  "Smolino",
  "Al Misrākh",
  "Valejas",
  "Leninsk",
  "Rače",
  "Deir Ḥannā",
  "Kurchatov",
  "Jūrīsh",
  "Enköping",
  "Yingzai",
  "Likupang",
  "Bilopillya",
  "Muḩambal",
  "Janakpur",
  "Reims",
  "Huochang",
  "Jinping",
  "Rainis",
  "Baiyinnuole",
  "Manjiang",
  "Qionghai",
  "Caleufú",
  "Las Vegas",
  "Parychy",
  "Jinhaihu",
  "Kup",
  "Colos",
  "Bardo",
  "Mangaran",
  "Boyu",
  "Kon Tum",
  "Yambrasbamba",
  "Jinchang",
  "Tubli",
  "Camagüey",
  "Baiju",
  "Andir",
  "Polo",
  "Tebon",
  "Cúcuta",
  "Pacucha",
  "Narva",
  "Kakaek",
  "Novozavidovskiy",
  "Gnosjö",
  "Watangan",
  "Gutang",
  "Maoyang",
  "Buray",
  "Banjar Geriana Kangin",
  "Kozlovice",
  "Lady Grey",
  "Vyshneye Dolgoye",
  "Tacuatí",
  "Cilegong",
  "Huliao",
  "Kamennogorsk",
  "Bridgetown",
  "Cipesing",
  "Rantaupanjangkiri",
  "Ruteng",
  "Ribeira Grande",
  "Urus-Martan",
  "Zouma",
  "Jiaoxie",
  "Lucapon",
  "Tabant",
  "Esil",
  "La Romana",
  "Zhongguanyi",
  "Tene",
  "Lý Sơn",
  "Jixi",
  "Cam Ranh",
  "Aleg",
  "Paris 04",
  "Dailing",
  "Cambebba",
  "Fredrikstad",
  "Póvoa de Santo António",
  "Pachīr wa Āgām",
  "Callahuanca",
  "Svetlyy",
  "Józefów",
  "Vacoas",
  "Kondrovo",
  "Nagykanizsa",
  "Kisai",
  "Yemva",
  "Hanjianglu",
  "Sukasari",
  "Balud",
  "Fatufeto",
  "Fukou",
  "Vandœuvre-lès-Nancy",
  "Xinpu",
  "Ngluwuk",
  "Catalina",
  "Bollstabruk",
  "Xiaojiang",
  "Granada",
  "Tvøroyri",
  "Santa Maria",
  "Cabaritan East",
  "Geneng",
  "Beidaihehaibin",
  "Fuxing",
  "Rokoy",
  "Datong",
  "Guancheng",
  "Bang Sao Thong",
  "Vychegodskiy",
  "Munjungan",
  "Hanfeng",
  "Chipoka",
  "Severo-Yeniseyskiy",
  "Burbank",
  "Jīwani",
  "Awarawar",
  "Dois Vizinhos",
  "Leigu",
  "Sukasari",
  "Buenos Aires",
  "Bamenda",
  "Nzeto",
  "Fuqiang",
  "Negombo",
  "Colorado Springs",
  "Congkar",
  "Almafuerte",
  "Xiji",
  "Stockholm",
  "Baranoa",
  "Alcains",
  "Austin",
  "Huaihe",
  "Xuyong",
  "Huayuan",
  "Yerba Buena",
  "Zhoutou",
  "Kutacane",
  "København",
  "Kupiskis",
  "Real",
  "Nelas",
  "Ulricehamn",
  "Phlapphla Chai",
  "Viña del Mar",
  "Xinglong",
  "Jiesheng",
  "Caála",
  "Baffa",
  "Mirovka",
  "Masuda",
  "Ngurenrejo",
  "Pulau Pinang",
  "Araguaiana",
  "Cabusao",
  "Urozhaynoye",
  "Daxin",
  "La Aurora",
  "Yangambi",
  "Vicente Guerrero",
  "Malax",
  "Pensacola",
  "Baisha",
  "Pandangan Kulon",
  "Pogag",
  "Guadalupe",
  "Kozel’shchyna",
  "Pestovo",
  "Guapi",
  "Viradouro",
  "Meaux",
  "Dłutów",
  "Vysehrad",
  "Santa Rita",
  "Kandete",
  "Wang Nam Yen",
  "Luzino",
  "Beijiang",
  "Somorpenang",
  "Spirit River",
  "Fuwah",
  "Obama",
  "Três Lagoas",
  "Campechuela",
  "Kisela Voda",
  "Sinanju",
  "Huxiaoqiao",
  "Cangshan",
  "Villa Nueva",
  "Nantou",
  "Makubetsu",
  "Kilinochchi",
  "Belén",
  "Quilmaná",
  "Caracal",
  "Tojeira",
  "Zhoupu",
  "Boshi",
  "Portão",
  "Hancheng",
  "Petaling Jaya",
  "Bouaké",
  "Zhaiwu",
  "Penamacor",
  "Yuzhou",
  "Pavia",
  "Pajo",
  "Kramators’k",
  "Itacoatiara",
  "Brok",
  "Juntang",
  "Babakandesa",
  "Huangmao",
  "Shuanghe",
  "Helixi",
  "Gedaliang",
  "Xincheng",
  "Nashville",
  "Taraco",
  "Pangai",
  "Mashava",
  "Bauang",
  "Chico",
  "Santo Domingo",
  "Przecław",
  "Goodlands",
  "Vaasa",
  "Yangwei",
  "Piquete",
  "Tours",
  "Phultala",
  "Ingeniero Guillermo N. Juárez",
  "Vitarte",
  "Shuangjing",
  "Almere Haven",
  "Varna",
  "Ostrowite",
  "Le Hochet",
  "Daduo",
  "Eaubonne",
  "Jambesari",
  "Likino-Dulevo",
  "Los Cedrales",
  "Austin",
  "Migrate",
  "Xiangjiazhai",
  "Memphis",
  "Navegantes",
  "Gujiang",
  "Kokologo",
  "Kitahiroshima",
  "Villeurbanne",
  "Saint-Gaudens",
  "Parlilitan",
  "Shaffa",
  "Kuybyshevskiy Zaton",
  "Mundybash",
  "Macroom",
  "Sukomulyo",
  "Huyuan",
  "Ljusdal",
  "Pagersari",
  "Agiásos",
  "Sandaowan",
  "Kisesa",
  "Richky",
  "Amado Nervo",
  "Konggar",
  "Raminho",
  "Xia Dawo",
  "Sandymount",
  "Rabat",
  "Cam Lâm",
  "Mingzhong",
  "Yinjiang",
  "Subulussalam",
  "Kawayan",
  "Pouzauges",
  "Yotala",
  "Bara Datu",
  "Ozubulu",
  "Matingain",
  "Ventersburg",
  "Halmstad",
  "Santa Cruz da Graciosa",
  "Libas",
  "Ngozi",
  "Fāraskūr",
  "Turus",
  "Azteca",
  "Klenica",
  "Vale da Pedra",
  "Karangan",
  "Södertälje",
  "Santa Catalina Norte",
  "Cullalabo del Sur",
  "Néa Éfesos",
  "Bendilwungu Lor",
  "Buruanga",
  "Vargas",
  "Dabao’anzhen",
  "Quba",
  "Sangali",
  "Torres Vedras",
  "Bentar",
  "Zhangbagou",
  "Oujiangcha",
  "Boguchar",
  "Masma",
  "Reshetnikovo",
  "Xunzhai",
  "Kolirerek",
  "Taibai",
  "Dearborn",
  "Pancas",
  "Bartošovice",
  "Gaizhou",
  "Rāipur",
  "Sadovo",
  "Bual",
  "Kayan Hulu",
  "Villeneuve-sur-Lot",
  "Arendal",
  "Sangesi",
  "Noisy-le-Grand",
  "Krajan Menggare",
  "At Samat",
  "Békéscsaba",
  "Laoxingchang",
  "Brandfort",
  "Aveiras de Cima",
  "Huaqiao",
  "Petřvald",
  "Río Viejo",
  "San Salvador de Jujuy",
  "Billdal",
  "Satinka",
  "Bugcaon",
  "Netrakona",
  "Wugong",
  "Matola",
  "La Julia",
  "Montpellier",
  "Qesarya",
  "Huanshi",
  "Estoril",
  "Zbiroh",
  "Quiriquire",
  "Oromocto",
  "Uberaba",
  "Bergen",
  "Haikoudajie",
  "Falköping",
  "Suyo",
  "Luoping",
  "Fedorovka",
  "Boé",
  "Wengyang",
  "Ban Phan Don",
  "Pineleng",
  "Yelat’ma",
  "Fangtian",
  "Limoges",
  "San Juan del Cesar",
  "Hägersten",
  "Qabqir",
  "Santa Maria",
  "Derhachi",
  "Zhaojia",
  "Qingyang",
  "Cancas",
  "Rakszawa",
  "Huatan",
  "Rudnyy",
  "Forquilhinha",
  "Stockholm",
  "Troyes",
  "Baras",
  "Dhī as Sufāl",
  "Kwali",
  "Dimona",
  "Washington",
  "Pondokdalem",
  "Meilin",
  "Sokarame",
  "Bucu Kidul",
  "Warri",
  "Nanxiang",
  "Toulouse",
  "Liperi",
  "Lichtenburg",
  "Girijaya",
  "Mumias",
  "Luojiang",
  "Ngulahan",
  "Trat",
  "Göteborg",
  "Deneysville",
  "Arhust",
  "Wilkołaz",
  "Watsa",
  "Tytuvėnėliai",
  "Ceará Mirim",
  "Teluk Pinang",
  "Dietaisi",
  "Cela",
  "Wang Hin",
  "Sanming",
  "Övertorneå",
  "Krasnodar",
  "Tyarlevo",
  "Sławatycze",
  "Haoguantun",
  "Peer",
  "Suka Makmue",
  "Anto",
  "Karangan",
  "Fandriana",
  "Las Vegas",
  "Sumbergebang",
  "Olival",
  "Linggamanik",
  "Gubkinskiy",
  "Santa Ana",
  "Ilihan",
  "Mulan",
  "Alcaria",
  "Malo",
  "Morales",
  "Ordóñez",
  "Bergen",
  "Huyuan",
  "Poá",
  "Milwaukee",
  "Bahorí",
  "Debeljača",
  "Oksa",
  "Turgun",
  "Litvínovice",
  "Pataypampa",
  "Freixo de Numão",
  "Austin",
  "Nangaroro",
  "Alor Setar",
  "Xiaoruo",
  "Chantilly",
  "Meniko",
  "Louveira",
  "Karelichy",
  "Shimanovsk",
  "Kedungdoro",
  "Kiamba",
  "Santa Luzia",
  "Primorsk",
  "Katuli",
  "Miami Beach",
  "Longping",
  "Hamburg",
  "Moita da Roda",
  "Dolní Sloupnice",
  "Doom",
  "San Fernando de Atabapo",
  "Ashcroft",
  "Lembur Tengah",
  "Porto Real",
  "Liverpool",
  "Watuagung",
  "Flers",
  "Mushu",
  "Šipovo",
  "Pantubig",
  "Armação de Búzios",
  "Gornji Milanovac",
  "Konobeyevo",
  "Sarae",
  "Novaya Derevnya",
  "Chiguang",
  "Huangnihe",
  "Huamali",
  "Tianmuhu",
  "Tarouca",
  "Picungbera",
  "Ningdun",
  "Xidoupu",
  "La Chapelle-sur-Erdre",
  "Huajialing",
  "Pasirputih",
  "Bairros",
  "Chiguayante",
  "Sremski Karlovci",
  "Dolores",
  "Yaring",
  "Kharabali",
  "Baixiang",
  "Ditang",
  "Bulu",
  "Apongo",
  "Languan",
  "Tyret’ Pervaya",
  "Banatsko Veliko Selo",
  "Łapsze Niżne",
  "Dabagou",
  "Grębków",
  "Dadaha",
  "Feijó",
  "Yidao",
  "Nonsan",
  "Xiaowuzhan",
  "Song’ao",
  "Yuetang",
  "Cibangban Girang",
  "Pukou",
  "Göteborg",
  "Hushan",
  "Mungwi",
  "Praya",
  "Beaufort",
  "Lyon",
  "Ladner",
  "Lucan",
  "Jablunkov",
  "Payabon",
  "Rila",
  "Corail",
  "Néa Smýrni",
  "Eslāmābād",
  "Cabay",
  "Najiaying",
  "Proletar",
  "Krzemieniewo",
  "Hetian",
  "Dayrūţ",
  "San Agustin",
  "Fichē",
  "Cikai",
  "Cipicung",
  "Montelíbano",
  "Marne-la-Vallée",
  "Dongluqiao",
  "Apaga",
  "Gexi",
  "Krajan",
  "Świebodzice",
  "Springfield",
  "Udënisht",
  "Marne-la-Vallée",
  "Yinping",
  "Lwengo",
  "Nakusp",
  "Yongping",
  "Kamphaeng Phet",
  "Betim",
  "Tagapul-an",
  "Ningmute",
  "Dayou",
  "Santa Cruz",
  "Blimbing",
  "Vellinge",
  "Jagdaqi",
  "Wang Muang",
  "Santa Justina",
  "Cockburn Town",
  "Couço",
  "Novyy Oskol",
  "Sebasang",
  "Argithéa",
  "Shicha",
  "Serzedo",
  "Baculin",
  "Lecheng",
  "Kanḏay",
  "Doctor Juan León Mallorquín",
  "Honglu",
  "Anār",
  "Wang Thonglang",
  "Igarapé Açu",
  "Kondrovo",
  "Créteil",
  "Limbe",
  "Pimian",
  "Fukiage-fujimi",
  "Zarszyn",
  "Balauring",
  "Bašaid",
  "Ouango",
  "Niagara Falls",
  "Ban Phan Don",
  "Dayr Abū Ḑa‘īf",
  "Wangqingtuo",
  "Duyên Hải",
  "Kalāleh",
  "Ålesund",
  "Quibal",
  "Dziadkowice",
  "Sofifi",
  "Kímolos",
  "Shalazhi",
  "Wukou",
  "Tampa",
  "Balung",
  "Shuangxing",
  "El Cardo",
  "Obihiro",
  "Logung",
  "Lokavec",
  "Carolina",
  "Lākshām",
  "Jingyu",
  "Al Ḩawāmidīyah",
  "Jakhaly",
  "Kfar NaOranim",
  "Ihuari",
  "Sukacai",
  "Pindobaçu",
  "Joševa",
  "Łomazy",
  "Maythalūn",
  "Ganjun",
  "Anfu",
  "Dmitriyevskoye",
  "Xiting",
  "Charxin",
  "Pontevedra",
  "Casal",
  "Pontevedra",
  "Hujiaba",
  "Loikaw",
  "Danyang",
  "Yugang",
  "Soraya",
  "Beloha",
  "Sendai",
  "Skoczów",
  "Pandan Niog",
  "España",
  "Bang Saphan",
  "Dongyang",
  "Fengjiang",
  "Kamuli",
  "Sekarjalak",
  "Yuanyang Zhen",
  "Pamatang",
  "Esfarāyen",
  "Seka",
  "Hyrynsalmi",
  "Pontevedra",
  "Kraljevica",
  "Xanxerê",
  "Lemenhe",
  "Myhove",
  "Jandayan",
  "Wonocolo",
  "Pivka",
  "Jablonec nad Nisou",
  "Mekele",
  "Potou",
  "Astana",
  "Bouaflé",
  "Mozhong",
  "Łaziska Górne",
  "Ercheng",
  "Changshou",
  "Rongwo",
  "Néa Róda",
  "Nuštar",
  "Kimhae",
  "Sumusţā as Sulţānī",
  "Kuybyshevskiy Zaton",
  "Dancheng",
  "Shingū",
  "Balta",
  "Johanneshov",
  "Krajan",
  "Banghai",
  "Baisha",
  "Longlisuo",
  "Barão de São Miguel",
  "Bariri",
  "Beppu",
  "Los Angeles",
  "Maomiaoji",
  "Koppies",
  "Charqueadas",
  "Alfta",
  "Rasi Salai",
  "Huyang",
  "Cigalontang",
  "Nova Viçosa",
  "Íos",
  "Carhuamayo",
  "Sintansin",
  "Tangtou",
  "Saint-Jean-de-Védas",
  "Rybinsk",
  "Shaykh al Ḩadīd",
  "Ar Rumaythah",
  "Brades",
  "Mococa",
  "Ḏânan",
  "Rasskazovo",
  "Krajan Satu",
  "Taoyuan",
  "Sosnovyy Bor",
  "Rungis",
  "Xiangyangpu",
  "Atakpamé",
  "Guebwiller",
  "Fier",
  "Batibati",
  "Dzagam",
  "Santa Rosa",
  "Sijiu",
  "Qi’an",
  "Biała Piska",
  "Sumbermanggis",
  "Divisoria",
  "Maştağa",
  "Langjun",
  "Santiago do Cacém",
  "Chocz",
  "Kizel",
  "Västerås",
  "Saint-Brieuc",
  "Berezna",
  "Huipinggeng",
  "Yanahuanca",
  "Hinlayagan Ilaud",
  "Saint-Avold",
  "Amiens",
  "Villazón",
  "Chong’ansi",
  "Dingjiayao",
  "Cimaragas",
  "Broniszewice",
  "Brodek u Přerova",
  "Foumban",
  "Străşeni",
  "Bukavu",
  "Tiên Lãng",
  "Jiangjiazui",
  "Bungkal",
  "Manonjaya",
  "Čoka",
  "Dayong",
  "Yuping",
  "Hongshunli",
  "Aix-en-Provence",
  "Tongshanxiang",
  "Maizuru",
  "Tuban",
  "Leuwihalang",
  "Cikomara",
  "Oropesa",
  "Omoa",
  "Vrýses",
  "Troitsk",
  "Lajaluhur",
  "Medvedok",
  "Kamsack",
  "Jiquinlaca",
  "Tubigan",
  "Bago",
  "Ventersdorp",
  "Solna",
  "Koszarawa",
  "Pallisa",
  "Outokumpu",
  "Slobodskoy",
  "Datong",
  "Minien East",
  "Bulacan",
  "Goubétto",
  "Dayan",
  "Borlänge",
  "Jinan-gun",
  "Tambakromo",
  "Butwāl",
  "Maranganí",
  "Borisovka",
  "Hushi",
  "Karasuyama",
  "Lorino",
  "Tong’an",
  "Yanzhou",
  "Hénin-Beaumont",
  "Skała",
  "Minyat an Naşr",
  "Helsingborg",
  "Babiak",
  "San Lorenzo",
  "Stonewall",
  "Zhendeqiao",
  "Liangshuihe",
  "Spasskoye",
  "Turirejo",
  "Shiyuetian",
  "Shuangjing",
  "Fray Luis A. Beltrán",
  "Negla",
  "Alfenas",
  "Catriel",
  "Masoli",
  "New Mīrpur",
  "Songkan",
  "Prachamtakham",
  "Paipa",
  "Bronnitsy",
  "Oeleu",
  "San Miguel",
  "Topeka",
  "Fier",
  "Burmakino",
  "Rahayu",
  "Saint-Jean-de-Luz",
  "Ketang",
  "Horad Rechytsa",
  "Real",
  "Ganzi",
  "Selaphum",
  "Circa",
  "East London",
  "Cinunjang",
  "Valongo",
  "Stockholm",
  "Charleston",
  "Meitang",
  "Vargem Grande",
  "Ribeira Grande",
  "Mollas",
  "Salaya",
  "Greda",
  "Agogo",
  "Scranton",
  "Mozdok",
  "Golek",
  "Gelsenkirchen",
  "San Luis",
  "Calingcuan",
  "Dingjiayao",
  "Campo Mourão",
  "Catriel",
  "Kuniran",
  "Srpska Crnja",
  "Cigadog Hilir",
  "Vancouver",
  "Talagante",
  "Port-à-Piment",
  "Duzhenwan",
  "Banjaranyar",
  "Kaindy",
  "Alae",
  "Aku",
  "Huixian Chengguanzhen",
  "Kuala Terengganu",
  "Kamieniec",
  "Liancheng",
  "Makiv",
  "Al Başrah",
  "Sankoutang",
  "Konsoy",
  "Jalqamūs",
  "Kubang",
  "Topolná",
  "Igarapava",
  "Shengli",
  "Buenaventura",
  "Jamaica",
  "Boawae"
]
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("color", child1);
  main.import("checkbox", child1);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
