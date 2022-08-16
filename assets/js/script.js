var userFormEl = document.querySelector('#user-form');
var cityEl = document.querySelector('#city');
var forecastEl = document.querySelector("#five-day-forcast");
var popCitiesEl = document.querySelector("#recommended-cities")

var updateRecentCities = function(city){
    var recentCities = JSON.parse(localStorage.getItem('recentcities'))
    if (!recentCities) {
        recentCities = {
            cities: ['Austin', 'Chicago', 'New York','Orlando', 'San Francisco', 'Seattle', 'Denver', 'Atlanta']
        }
        for (var j=0; j < recentCities.cities.length; j++) {
            if (city === recentCities.cities[j]) {
                return
            }
        }
        if (recentCities.cities.length <= 8){
            recentCities.cities.pop();
            recentCities.cities.unshift(city);
        }
        else {
            recentCities.cities.unshift(city)
        }       
    }
    else {
        for (var j=0; j < recentCities.cities.length; j++) {
            if (city === recentCities.cities[j]) {
                console.log('City is already on recents')
                return
            }
        }
        if (recentCities.cities.length <= 8){
            recentCities.cities = recentCities.cities.slice(0, -1);;
            recentCities.cities.unshift(city);
        }
        else {
            recentCities.cities.unshift(city)
        }   
    }
    localStorage.setItem('recentcities', JSON.stringify(recentCities));
    for(var i=0; i<recentCities.cities.length; i++){
        var buttonEl = document.querySelector("#city-" + JSON.stringify(i))
        buttonEl.textContent = recentCities.cities[i]
    }
}

var getCityCoordinates = function(event){
    event.preventDefault();
    //checks if the cityEl has a value, and if it does it appends that value to the apiUrl to recieve the longitude and lattitude
    if (cityEl.value){
        var coordinatesApiURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityEl.value.toLowerCase() + "&appid=0c03238cfd49d5089791230ebb0a1f08"
        fetch(coordinatesApiURL).then(function(response){
            if (response.ok) {
                response.json().then(function(data) {
                    //grabs that data and runs the getCityWeather function with the lon and lat as the parameters
                    var lattitude = data[0].lat
                    var longitude = data[0].lon
                    getCityWeather(lattitude, longitude)
                    updateRecentCities(cityEl.value)
                })
            }
        })
    }
    else {
        console.log('The search bar was empty')
    }
}

var getCityWeather = function(lat, lon) {
    // gets the cities weather then runs the getCurrentWeather with the data as the parameter
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=0c03238cfd49d5089791230ebb0a1f08'
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                //console.log(data)
                getCurrentWeather(data)
            })
        }
    })
}

var getCurrentWeather = function(weather) {
    // sets the cityNameEl to the cityEl value + the current date
   var cityNameEl = document.querySelector("#city-name");
   cityNameEl.textContent = cityEl.value + " " + moment().format('(M/D/YYYY)');

    // sets the weather icon img to the current weather icon then clears the cityEl.value
   var iconImg = document.getElementById('weather-icon');
   iconImg.setAttribute('src', 'https://openweathermap.org/img/wn/' + weather.current.weather[0].icon + '@2x.png');
   iconImg.setAttribute('class', 'mark p-0 icon');

   cityEl.value = '';
    
   // filters through the data and sets that as the p elements in the current weather div
    var tempEl = document.querySelector("#temp");
    tempEl.textContent = "Temp: " +  weather.current.temp + '°F';

    var windEl = document.querySelector("#wind");
    windEl.textContent = "Wind: " +  weather.current.wind_speed + ' MPH';

    var humidityEl = document.querySelector("#humidity");
    humidityEl.textContent = "Humidity: " + weather.current.humidity + ' %';

    var UVpEl = document.querySelector('#uv-index-name')
    UVpEl.textContent = 'UV Index: '
    var UVEl = document.querySelector("#uv-index");
    UVEl.textContent = weather.current.uvi;

    // checks the air quality index and depending on the air quality, it changes the background color then runs the getFiveDayForecast with the weather data as the parameter
    if (weather.current.uvi <= 2) {
        UVEl.classList.add('bg-success');
    }
    else if (weather.current.uvi > 2 || weather.current.uvi < 8) {
        UVEl.classList.add('bg-warning');
    }
    else {
        UVEl.classList.add('bg-danger');
    };
    getFiveDayForecast(weather);
};

var getFiveDayForecast = function(weather){
    //clears the information by removing all child elements of the forecastEl
    removeAllChildNodes(forecastEl);
    for (var i=1; i < 6; i++){
        var cardEl = document.createElement('div');
        cardEl.setAttribute('class', 'card-el text-light card w-100 mr-4 p-2')

        var dateEl = document.createElement('h3');
        dateEl.setAttribute('class', 'mb-0 font-weight-bold')
        dateEl.textContent = moment().add(i, 'd').format('M/D/YYYY')

        cardEl.appendChild(dateEl);

        var iconEl = document.createElement('img');
        iconEl.setAttribute('src', 'https://openweathermap.org/img/wn/' + weather.daily[i].weather[0].icon + '@2x.png');
        iconEl.setAttribute('class', 'mark p-0 icons mb-2');

        cardEl.appendChild(iconEl);

        tempEl = document.createElement('p');
        tempEl.textContent = 'Temp: ' + weather.daily[i].temp.day + '°F';

        cardEl.appendChild(tempEl)


        windEl = document.createElement('p')
        windEl.textContent = 'Wind: ' + weather.daily[i].wind_speed + ' MPH'

        cardEl.appendChild(windEl)

        humidityEl = document.createElement('p')
        humidityEl.textContent = "Humidity " + weather.daily[i].humidity + ' %'

        cardEl.appendChild(humidityEl)

        forecastEl.appendChild(cardEl)
 
    }
}

var getPopCityWeather = function(event) {
    if (event.target.className === 'bg-secondary btn w-100 mb-4'){
        cityEl.value = event.target.textContent;
        getCityCoordinates(event)
    }  else {
        console.log('')
    }  
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

var getRecentCities = function(){
    var recentCities = JSON.parse(localStorage.getItem('recentcities'))
    if (!recentCities || recentCities === 'null') {
        return
    }   
    for(var i=0; i<recentCities.cities.length; i++){
        var buttonEl = document.querySelector("#city-" + JSON.stringify(i))
        buttonEl.textContent = recentCities.cities[i]
    }
}

userFormEl.addEventListener("submit", getCityCoordinates);
popCitiesEl.addEventListener('click', getPopCityWeather);
getRecentCities();