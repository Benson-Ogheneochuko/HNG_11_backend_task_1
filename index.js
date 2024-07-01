// imports
const express= require('express')
const app = express()
require('dotenv').config();


const port = process.env.PORT || 3000;
const weatherApiKey = process.env.WEATHER_API_KEY;

class UserDetails {
  constructor(client_ip, location, temperature, name) {
    this._client_ip = client_ip;
    this._location = location;
    this._temperature = temperature;
    this._name = name;
    this.greeting = this._createGreeting();
  }

  _createGreeting() {
    return `Hello ${this._name}! The temperature is ${this._temperature} degrees Celsius in ${this._location}`;
  }

  getPublicDetails() {
    return {
      client_ip: this._client_ip,
      location: this._location,
      greeting: this.greeting
    };
  }
}

const locationDetails = async (ip) => {
  const weatherApi = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${ip}&aqi=no`;
  
  try {
    const response = await fetch(weatherApi);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const { location, current } = data;
    
    return {
      location_name: location.name,
      temperature: current.temp_c
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return { location_name: 'Unknown', temperature: null };
  }
};
app.get('/', (req,res)=>{
  res.status(200).send('Please enter the following in the url bar: /api/hello?visitors_name=Your Name')
})
app.get('/api/hello', async (req, res) => {
  const client_ip = req.ip;
  const visitor_name = req.query.visitor_name || 'Mark';
  
  try {
    const { location_name, temperature } = await locationDetails(client_ip);
    const userDetails = new UserDetails(client_ip, location_name, temperature, visitor_name);
    res.json(userDetails.getPublicDetails());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// create express server
app.listen(port, ()=> {
  console.log('server running on '+ port)
})