var cityList = $("#city-list");
var cities = [];
var key = "62653a8445711298040e7a90c69678bb";

// display date
function formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// store searched cities into local storage
function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
    console.log(localStorage);
}

// retrieve searched cities from local storage
function init() {
    cities = JSON.parse(localStorage.getItem("cities")) || [];
    renderCities();
}

// render cities to "recently searched" list
function renderCities() {
    cityList.empty();

    if (cities.length === 0) {
        cities.push("New York");
    }

    cities.forEach(function (city) {
        var li = $("<li>").text(city).attr({
            id: "listC",
            "data-city": city,
            class: "list-group-item"
        });
        cityList.prepend(li);
    });

    // display default weather data for New York City
    var mostRecentCity = cities[cities.length - 1];
    getResponseWeather(mostRecentCity);
}
// add newly searched city to "recently searched" list
$("#add-city").on("click", function (event) {
    event.preventDefault();
    var city = $("#city-input").val().trim();

    if (city) {
        cities.push(city);
        storeCities();
        renderCities();
    }
});

// api calls

// fetch and append current weather data
function getResponseWeather(cityName) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;
    var currentWeather = $("#today-weather");

    currentWeather.empty();

    fetch(apiUrl)
        .then(response => response.json())
        .then(response => {
            var heading = $("<h3>").text(`${response.name} ${formatDate(new Date())}`);
            currentWeather.append(heading);

            var temperature = parseInt((response.main.temp) * 9 / 5 - 459);
            currentWeather.append($("<p>").text(`Temperature: ${temperature} °F`));
            currentWeather.append($("<p>").text(`Humidity: ${response.main.humidity} %`));
            currentWeather.append($("<p>").text(`Wind Speed: ${response.wind.speed} MPH`));

        // fetch and append uv index info
            var apiUrl2 = `https://api.openweathermap.org/data/2.5/uvi?appid=${key}&lat=${response.coord.lat}&lon=${response.coord.lon}`;

            fetch(apiUrl2)
                .then(responseuv => responseuv.json())
                .then(responseuv => {
                    var cityUV = $("<span>").text(responseuv.value);
                    var cityUVp = $("<p>").text("UV Index: ").append(cityUV);
                    currentWeather.append(cityUVp);

                    var uvClass = responseuv.value > 0 && responseuv.value <= 2 ? "green" :
                        responseuv.value > 2 && responseuv.value <= 5 ? "yellow" :
                        responseuv.value > 5 && responseuv.value <= 7 ? "orange" :
                        responseuv.value > 7 && responseuv.value <= 10 ? "red" : "purple";

                    cityUV.attr("class", uvClass);
                });
        
        // fetch and append 5 day weather forecast
            var apiUrl3 = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${key}`;

            fetch(apiUrl3)
                .then(response5day => response5day.json())
                .then(response5day => {
                    var boxes = $("#boxes").empty();

                    for (var i = 0, j = 0; j <= 5; i = i + 6) {
                        var read_date = response5day.list[i].dt;

                        if (response5day.list[i].dt != response5day.list[i + 1].dt) {
                            var FivedayDiv = $("<div>").attr("class", "col-3 m-2 bg-primary");
                            FivedayDiv.css({
                                'padding': '10px',
                                'border-radius': '5px',
                                'background': 'linear-gradient(to right, #614385, #516395)',
                                'color': 'white',
                                'font-weight': '400'
                                // Add any other styles you want
                            });
                            var date = new Date(0).setUTCSeconds(read_date);
                            var dayOutput = formatDate(new Date(date));

                            FivedayDiv.append($("<h6>").text(dayOutput));
                            var imgtag = $("<img>").attr("src", getWeatherIcon(response5day.list[i].weather[0].main));
                            var temperature = parseInt((response5day.list[i].main.temp) * 9 / 5 - 459);
                            FivedayDiv.append(imgtag, $("<p>").text(`Temperature: ${temperature} °F`), $("<p>").text(`Humidity: ${response5day.list[i].main.humidity} %`));
                            boxes.append(FivedayDiv);
                            j++;
                        }
                    }
                });
        });
}

// change weather icons based on forecast
function getWeatherIcon(skyConditions) {
    switch (skyConditions) {
        case "Clouds":
            return "https://img.icons8.com/color/48/000000/cloud.png";
        case "Clear":
            return "https://img.icons8.com/color/48/000000/summer.png";
        case "Rain":
            return "https://img.icons8.com/color/48/000000/rain.png";
        default:
            return "";
    }
}

// call function
$(document).on("click", "#listC", function () {
    var thisCity = $(this).attr("data-city");
    getResponseWeather(thisCity);
});

init();
