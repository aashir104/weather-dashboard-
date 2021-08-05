var searchheader = document.querySelector(".search-input");
var searchaddin = document.querySelector("#searchCity");
var weatherCurrent = document.querySelector("#current-weather");
var forecast = document.querySelector(".forecast");
var displayHistory = document.querySelector("#search-history");
var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
var dateToday = moment().format("YYYY-MM-DD");

//-----WARNING MESSAGE -----------------
var warning = function() 
{
    weatherCurrent.classList.remove("border","border-dark");
    weatherCurrent.textContent = "City not found, please try again!!";
    forecast.textContent = "";
    weatherCurrent.classList.add("warning");
}

  //-----API TO SEARCH WITH CITY NAME AS INPUT----------------------------------------------------------------
var fetchMe = function(city) {
    fetch(
      
        "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=71caaa193e9262e0eb4c901abdadf9c8&units=metric"
    ).then(function(response) 
    {
        if (response.ok) 
        {
            response.json().then(function(data) 
            {
                
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                var cityName = data.name + ", " + data.sys.country;
                
                fetch(
                    "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly,alerts&appid=71caaa193e9262e0eb4c901abdadf9c8&units=metric"
                ).then(function(response) 
                {
                    if (response.ok) 
                    {
                        response.json().then(function(data) 
                        {
                            currentDisplay(data, cityName);
                            weatherForForecast(data);
                            saveSearch(city);
                            loadButtons();
                        })   
                    }
                    else 
                    {
                        warning();
                    }
                })
            })
        }
        else 
        {
            warning();
        }
    })
}



//-----DISPLAYS THE CURRENT WEATHER DETAILS-----//
var currentDisplay = function(data, city) 
{
    var date = moment((data.current.dt)*1000).format("YYYY-MM-DD");
    var icon = "http://openweathermap.org/img/w/"+data.current.weather[0].icon+".png";
    var temp = data.current.temp;
    var wind = data.current.wind_speed;

    //Convert to KMPH and display only 2 decimal points
    wind = (parseFloat(wind) * 3.6).toFixed(2);
    var humidity = data.current.humidity;
    var uvi = parseFloat(data.current.uvi);

    
    
    weatherCurrent.textContent = "";
   

    weatherCurrent.classList.remove("warning");
    
    //-----ADDS BORDER -----
    weatherCurrent.classList.add("border","border-dark");
    var cityDetails = document.createElement("h2");
    cityDetails.classList.add("m-2");
    cityDetails.innerHTML = city + "  " + " ("+date+") " + "<img src='"+icon+"' alt='icon'/>"

    //-----WEATHER DETAILS--------------------------------
    var weatherDetail = document.createElement("article");
    weatherDetail.classList.add("m-2", "weatherDetails");
    weatherDetail.innerHTML = "<p>Temp: "+temp+"°C</p><p>Wind: "+wind+" KPH</p><p>Humidity: "+humidity+" %</p><p>UV Index: <span id='uvi' class='px-3'> "+uvi+" </span></p>"
   
    weatherCurrent.appendChild(cityDetails);
    weatherCurrent.appendChild(weatherDetail);

    //-----INDEX COLOUR CODING-----------
    var Color = document.querySelector("#uvi");
    if (uvi>=0 && uvi <3) 
    {
        Color.classList.add("badge", "badge-success")
    } else if (uvi>=3 && uvi <6) 
    {
        Color.classList.add("badge", "badgeYellow")
    } else if (uvi>=6 && uvi <8) 
    {
        Color.classList.add("badge", "badgeOrange")
    } else if (uvi>=8 && uvi <11) 
    {
        Color.classList.add("badge", "badge-danger")
    } else if (uvi>=11) 
    {
        Color.classList.add("badge", "badgeViolet")
    } 
}

var weatherForForecast = function(data) 
{
    var counter = 0;
    
    forecast.textContent = "";

    //-----DISPLAYS HEADER ---------------------
    var forecastHeader = document.createElement("h2");
    forecastHeader.className = "forecastHead my-3";
    forecastHeader.textContent = "5-Day Forecast:";

    //-----FORECAST SECTION----------------------------
    var forecastSection = document.createElement("div");
    forecastSection.className = "d-flex forecastFlex";

    //-----LOOP TO DISPLAY WEATHER-----
    console.log();

    for (var i=0; i<data.daily.length; i++) 
    {
        var date = moment((data.daily[i].dt)*1000).format("YYYY-MM-DD");
        var icon = "http://openweathermap.org/img/w/"+data.daily[i].weather[0].icon+".png";
        var temp = data.daily[i].temp.max;
        var wind = data.daily[i].wind_speed;

        //CONVERTING TO KMPH AND DISPLAYING IT BY 2 DECIMALS--------- 
        wind = (parseFloat(wind) * 3.6).toFixed(2);
        var humidity = data.daily[i].humidity;
        

        //-----DATA DISPLAYED ONLY DATES GREATER THEN SIX FROM CURRENT DATE---------------------------------------------------------------------------
        if (date > dateToday && counter <5) {
            var dayDisplay = document.createElement("article");
            dayDisplay.className = "dayDisplay m-1"
            dayDisplay.innerHTML = "<p>"+date+"</p><div><img src='"+icon+"' alt='icon'/></div><p>Temp: "+temp+"°C</p><p>Wind: "+wind+" KPH</p><p>Humidity: "+humidity+" %</p>";
            counter++;
            forecastSection.appendChild(dayDisplay);
        }
    }
    forecast.appendChild(forecastHeader);
    forecast.appendChild(forecastSection);
}

//-----PREVIOUS HISTORY SAVED-----
var saveSearch = function(city) 
{
    
    if (!city) 
    {
        return;
    } 

    else if (!(searchHistory.includes(city))) 
    {
        searchHistory.splice(0,0,city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}
//-----SUBMIT BUTTON FUNCTION ------------------
var weatherSearch = function(event) 
{
    event.preventDefault();
    var city = searchaddin.value;
    searchaddin.value = "";
    fetchMe(city);
}

//-----HISTORY FOR SEARCH BUTTON-----
var loadButtons = function() 
{
    displayHistory.textContent = ""
    searchHistory.splice(8,1000);
    
    for (var i=0; i<searchHistory.length; i++) 
    {
        var btn = document.createElement("button");
        btn.className = "btn btn-secondary text-center my-2";
        btn.textContent = searchHistory[i];
        displayHistory.appendChild(btn);
    }
}

//----- HANDLER FOR SEARCH HISTORY -----
var clickHandler = function(event) 
{
    var city = event.target.textContent;
    fetchMe(city);
}

//----- SUBMIT----------------------------------------
searchheader.addEventListener("submit", weatherSearch);

//-----CLICKS ON SEARCH HISTORY-----------------------
displayHistory.addEventListener("click", clickHandler);

//-----LOAD SEARCH HISTORY BUTTONS--------------------
window.addEventListener("load", loadButtons);