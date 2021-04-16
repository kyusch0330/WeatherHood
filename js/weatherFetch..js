"use strict";

import {openweathermapKey as weatherKey} from "./APIkeys.js";

class WeatherInfo{
  constructor(city, main, weather, wind){
    this.city = city;
    this.main = main;
    this.weather = weather;
    this.wind = wind;
  }
}

const weatherInfo = new WeatherInfo(null,null,null,null);

function setWeatherObj(data){
  console.log(data);
  weatherInfo.city = data.name;
  weatherInfo.main = {
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    temp: data.main.temp,
    temp_max: data.main.temp_max,
    temp_min: data.main.temp_min
  };
  weatherInfo.weather = {
    main: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon
  }
  weatherInfo.wind = {
    deg: data.wind.deg,
    speed: data.wind.speed
  }
  // console.log(weatherInfo);
  showWeather();
}

//fetch Weather from API server
function fetchWeather(position){
  const lon = //position.coords.longitude;
              Math.random()*100;
  const lat = //position.coords.latitude;
              Math.random()*100;
  const key = weatherKey; //openweathermap's API key
  console.log(key);
  fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=kr`)
  .then(response => response.json())
  .then(setWeatherObj);
}

function getPosFail(){
  console.log(new Error("fail to get Position Error"));
}

const body = document.body;

const timeBox = document.querySelector(".timeInfo");
function showTime(){
  const date = new Date();
  timeBox.firstChild.nodeValue = 
    `${date.getMonth()+1}/${date.getDate()}
     ${date.getHours()}:${date.getMinutes()<10 ? '0'+date.getMinutes():date.getMinutes()}`;
}
showTime();
setInterval(showTime,1000);

const weatherInfoBox 
  = document.querySelector(".weatherInfo");

const mainInfoBox 
  = document.querySelector(".mainInfo");

const subInfoBox
  = document.querySelector(".subInfo");

const weatherDetailsBox
  = document.querySelector(".weatherDetails");

function showWeather(){
  setBackground();
  showWeatherInfo();
  showWeatherDetails();
  showWeatherGraphics();
}


function setBackground(){
  body.style.backgroundImage = `url(../images/image_${weatherInfo.weather.main}.png)`;
}


function showWeatherInfo(){
  weatherInfoBox.childNodes[1].firstChild.nodeValue
    = `현재 ${weatherInfo.city} 의 날씨는` ;

  //weather image
  mainInfoBox.childNodes[1].src 
    = `../images/icon_${weatherInfo.weather.main}.png`;

  //weather description
  //온흐림은 실생활에서 쓰이지 않는 말이라 흐림으로 
  const weatherDescription = weatherInfo.weather.description==="온흐림"? "흐림": weatherInfo.weather.description;
  mainInfoBox.childNodes[3].firstChild.nodeValue = `${weatherDescription} `;
  
  //create subInfo's items
  createSubInfoItem("fas fa-thermometer-three-quarters", weatherInfo.main.temp, "℃");
  createSubInfoItem("fas fa-wind", weatherInfo.wind.speed, "m/s");
  createSubInfoItem("fas fa-tint", weatherInfo.main.humidity, "%");
}

function createSubInfoItem(iconClass, data, unit){
  const info = document.createElement("div");
  const icon = document.createElement("i");
  const text = document.createElement("span");
  icon.className = iconClass;
  text.innerHTML = ` ${data} ${unit}`;
  info.appendChild(icon);
  info.appendChild(text);
  subInfoBox.appendChild(info);
}

const weatherDetailsHeader = document.querySelector(".weatherDetailsHeader");
const tempDetailsBox = document.querySelector(".tempDetails");
const windDetailsBox = document.querySelector(".windDetails");

function showWeatherDetails(){
  //기온 파트 : 체감, 최저, 최고
  //풍속 파트
  weatherDetailsHeader.innerHTML = `details`;

  const feelTemp = weatherInfo.main.feels_like;
  const humanIcon = document.createElement("i");
  humanIcon.className = "fas fa-male";
  humanIcon.style.color = `rgb(${0+feelTemp*5},0,${200-feelTemp*6})`;
  tempDetailsBox.appendChild(humanIcon);

  windDetailsBox.firstChild.nodeValue="바람아 불어라";
}

function showWeatherGraphics(){
  //풍향계 그래픽 구현
}



function init(){
  window.navigator.geolocation.getCurrentPosition(fetchWeather,getPosFail);
}

init();
