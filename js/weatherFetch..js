"use strict";

import {openweathermapKey as weatherKey} from "./APIkeys.js";

class WeatherInfo{
  constructor(){
    this.city = null;
    this.main = null;
    this.weather = null;
    this.wind = null;
    this.clouds = null;
    this.others = null;
  }
}

const weatherInfo = new WeatherInfo();

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
    speed: data.wind.speed,
    gust: data.wind.gust
  }
  weatherInfo.clouds = data.clouds;

  if(data.rain!==undefined) weatherInfo.others = data.rain;
  if(data.snow!==undefined) weatherInfo.others = data.snow;
  // console.log(weatherInfo);
  showWeather();
}

//fetch Weather from API server
function fetchWeather(position){
  const lon = position.coords.longitude;
              //Math.random()*100;
  const lat = position.coords.latitude;
              //Math.random()*100;
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
  const city = weatherInfo.city===""?"해당 지역":weatherInfo.city; 
  weatherInfoBox.childNodes[1].firstChild.nodeValue
    = `현재 ${city} 의 날씨는` ;

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


const weatherDetailsHeader 
  = document.querySelector(".weatherDetailsHeader");
const tempDetailsHeader 
 = document.querySelector(".tempDetailsHeader");
const tempManImg 
  = document.querySelector(".tempManImg");
const tempDetailsInfo 
  = document.querySelector(".tempDetailsInfo");
const windDetailsHeader
  = document.querySelector(".windDetailsHeader");
const windDetailsInfo 
  = document.querySelector(".windDetailsInfo");
const othersHeader
  = document.querySelector(".othersHeader");
const others
  = document.querySelector(".others");

function showWeatherDetails(){
  //기온 파트 : 체감, 최저, 최고
  //풍속 파트
  weatherDetailsHeader.innerHTML = `details`;

  //tempDetails
  tempDetailsHeader.innerHTML = "기온";
  //create tempMan img
  const humanIcon = document.createElement("i");
  const feelTemp = weatherInfo.main.feels_like;
  humanIcon.className = "fas fa-male";
  //체감온도에 따라 색 변환
  const base = 17;
  const diff = Math.abs(feelTemp-base);
  const green = 160-diff*4.5;
  const red = feelTemp>=base?215+diff*2:green;
  const blue = feelTemp>=base?green:215+diff;
  humanIcon.style.color = `rgb(${red},${green},${blue})`;
  tempManImg.appendChild(humanIcon);

  //create tempDetailsInfo items
  createTempDetailsInfoItem("체감",weatherInfo.main.feels_like);
  createTempDetailsInfoItem("최고",weatherInfo.main.temp_max);
  createTempDetailsInfoItem("최저",weatherInfo.main.temp_min);

  //windDetails
  windDetailsHeader.innerHTML = "바람";
  //create windDetailsInfo items
  const windDirect = getWindDirection(weatherInfo.wind.deg);
  const windDirectInfo = document.createElement("span");
  windDirectInfo.innerHTML = `초속 ${weatherInfo.wind.speed}m ${windDirect}풍`
  windDetailsInfo.appendChild(windDirectInfo);

  //draw windDrection graphic
  drawWindDirection(weatherInfo.wind.deg,weatherInfo.wind.speed);

  //others
  othersHeader.innerHTML = "기타상세";
  //create others items
  if(weatherInfo.weather.main === "Rain"){
      createOthersItem(weatherInfo.others, "우")      
  }
  else if(weatherInfo.weather.main === "Snow"){
    createOthersItem(weatherInfo.others, "설");
  }
  //common info
  if(weatherInfo.clouds !== undefined){
    const clouds = document.createElement("li");
    clouds.innerHTML = `구름량 : ${weatherInfo.clouds.all} %`;
    others.appendChild(clouds);
  }
  if(weatherInfo.main.pressure !== undefined){
    const pressure = document.createElement("li");
    pressure.innerHTML = `기압 : ${weatherInfo.main.pressure} hPa`;
    others.appendChild(pressure);
  }
  if(weatherInfo.wind.gust !== undefined){
    const gust = document.createElement("li");
    gust.innerHTML = `돌풍 세기 : ${weatherInfo.wind.gust} m/s`;
    others.appendChild(gust);
  }


}

function createTempDetailsInfoItem(tempType, data){
  const info = document.createElement("li");
  info.innerHTML = `${tempType} 기온 : ${data} ℃`;
  tempDetailsInfo.appendChild(info);
}

function getWindDirection(deg){
  const north = 360, east = 90, south = 180, west = 270;
  if(deg<30) return "북";

  if(deg<east-30) return "북동";
  if(deg<east+30) return "동";

  if(deg<south-30) return "남동";
  if(deg<south+30) return "남";

  if(deg<west-30) return "남서";
  if(deg<west+30) return "서";

  if(deg<north-30) return "북서";
  else return "북";
}

const canvasContainer = document.querySelector(".canvasContainer");
const canvas = document.getElementById("windDirectionCanvas");

function drawWindDirection(deg,speed){
  if(canvas.getContext){
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(230,30,30)";
    ctx.fillRect(145,40,10,70);
    ctx.beginPath();
    ctx.moveTo(150,125);
    ctx.lineTo(165,100);
    ctx.lineTo(150,110);
    ctx.lineTo(135,100);
    ctx.moveTo(150,70);
    ctx.lineTo(165,30);
    ctx.lineTo(150,40);
    ctx.lineTo(135,30);
    ctx.fill();
  }
  if(speed>8) speed=8;
  canvasContainer.style.backgroundImage = `url("../images/compass.png")`  
  setArrowDirection(deg,speed);  
}

function setArrowDirection(deg,speed){
  setInterval(()=>{
    const ran=deg+Math.random()*16-8;
    canvas.style.transform = `rotate(${ran}deg)`;
  },1000-100*speed);
}

function createOthersItem(othersInfo, type){
  for(let i in othersInfo){
    const info = document.createElement("li");
    info.innerHTML = `${i.slice(0,1)}시간 강${type}량 : ${othersInfo[i].toFixed(2)} mm`;
    others.appendChild(info);
  }
}

function showWeatherGraphics(){
  //풍향계 그래픽 구현
}



function init(){
  window.navigator.geolocation.getCurrentPosition(fetchWeather,getPosFail);
}

init();
