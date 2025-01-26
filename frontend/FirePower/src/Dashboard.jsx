import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import Navbar from './components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function Dashboard() {
    const [UserLocation, setUserLocation] = useState({});
    const [Weather, setWeather] = useState('');
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const [videoUrl, setVideoUrl] = useState(null);
    const [update, setUpdate] = useState(0);
    const [severeWeather, setsevereWeather] = useState("");
    const [aiResponse, setAI] = useState("");
    const currentip = "https://172.20.10.2:8000"; 


    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        }
        else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    async function getLatestVid() {
        try {
            const response = await fetch(currentip+'/latest', {
                method: 'GET'
            });
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            if (contentType && contentType.includes('video/mp4')) {

                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(blob);
                console.log(videoUrl);

                return { success: true, video: videoUrl };
            }
            else {
                const result = await response.json();
                console.log("MAYDAYMAYDAYMAYDAY")
                console.log(result)
                return { success: false, video: "" };
            }
        }

        catch (error) {
            console.log(error)
            console.log("Error fetching video")
        }
    }

    async function getLatestVidTwo() {
        try {
            const response = await fetch(currentip+'/latesttwo', {
                method: 'GET'
            });
            console.log("Here 1")
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            
            if (contentType && contentType.includes('video/mp4')) {
                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(
                    new Blob([blob], { type: 'video/mp4' })
                );
                console.log("Video URL:", videoUrl);
                return { success: true, video: videoUrl };
            } else {
                const result = await response.json();
                console.log("Error:", result);
                return { success: false, video: "" };
            }
        } catch (error) {
            console.error("Error fetching video:", error);
            return { success: false, video: "" };
        }
    }

    
    


    useEffect(() => {
        getUserLocation();

        const fetchVideo = async () => {
            try {
                console.log("here before one")
                const video = await getLatestVidTwo();
                console.log("Video response:", video);
                if (video.success) {
                    setVideoUrl(video.video);
                }
            } catch (error) {
                console.error('Error fetching video:', error);
            }
        };

        // Call it
        fetchVideo();
        getFireStatus();
        
    }, [update]);

    useEffect(() => {
        if (UserLocation.latitude && UserLocation.longitude) {
            getWeather(UserLocation.latitude, UserLocation.longitude);
        }
        

    }, [UserLocation]);

    const getWeather = async (lat, long) => {
        console.log(lat, long)
        const url = `https://api.weather.gov/points/${lat},${long}`;
        //https://api.weather.gov/points/34.0522346,-118.2436849
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch weather alerts");
            }
            const data = await response.json();

            const forecastUrl = data.properties.forecast;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                throw new Error("Failed to fetch forecast data");
            }
            const forecastData = await forecastResponse.json();
            const severeData = await fetch(`https://api.weather.gov/alerts/active?status=actual,exercise,system,test,draft&message_type=alert,update,cancel&point=${UserLocation.latitude},${UserLocation.longitude}&limit=500`);
            setsevereWeather(severeData.stringify());
            setWeather(forecastData.properties.periods[0].detailedForecast);
        }
        catch (error) {

        };

    };


    async function getFireStatus(){
        console.log(UserLocation);
        getWeather(UserLocation.latitude, UserLocation.longitude)
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API);
        console.log(import.meta.env.VITE_GOOGLE_GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let forecast = ""
        console.log(severeWeather)
        if(Weather != ""){
            forecast = Weather;
        }
        else{
            forecast = "Sunny skys and high humidity"
        }
        
        const severe = await fetch(`https://api.weather.gov/alerts/active?status=actual,exercise,system,test,draft&message_type=alert,update,cancel&point=${UserLocation.latitude},${UserLocation.longitude}&limit=500`);
        console.log(forecast)
        console.log(severe)
        const prompt = " Be extremely consise and respond in a 3 sentences only, You are a hazard and danger analysis bot and you must inform the user of current dangers in their area regarding wildfire and give a prediction as to weather there could be a fire in the area using NOAA Data Below:"+forecast+ "Severe Weather JSON:" + JSON.stringify(severe) + "if no data is provided summarize the fire risks for florida";
        console.log(prompt)
        const result = await model.generateContent(prompt);
        
        console.log(result.response.text());
        setAI(result.response.text());
    }
    

    return (
        <>
            {isAuthenticated}
            <Navbar/>
            <div className="grid grid-cols-6 grid-rows-7 gap-4 min-h-screen">
                <div className="col-span-4 col-start-2 text-center border-2 rounded-sm">DashBoard {videoUrl && <p>Possible fire may have been detected</p>}</div>
                <div className="col-span-2 row-span-2 col-start-2 row-start-2 text-center border-2 rounded-sm">Last Check
                
                        {videoUrl && (
            <ReactPlayer
                url={videoUrl}
                controls={true}
                width="100%"
                height="auto"
                playing = {true}
                onReady={() => console.log("Player ready")}
                onError={(e) => console.error("Player error:", e)}
                config={{
                    file: {
                        attributes: {
                            crossOrigin: "anonymous"
                        },
                        forceVideo: true,
                        forceHLS: false,
                        forceDASH: false
                    }
                }}
            />
        )}
        {!videoUrl && <p>No Updates Yet, Please Setup a Camera</p>}
                </div>
                <div className="col-span-2 row-span-2 col-start-4 row-start-2 text-center border-2 rounded-sm">Fire Probability {aiResponse}</div>
                <div className="col-span-4 row-span-2 col-start-2 row-start-4 text-center border-2 rounded-sm">
                    <h1>Weather</h1>
                    <p className="text-white">{Weather}</p>

                </div>
                <div className="col-span-4 row-span-2 col-start-2 row-start-6 text-center border-2 rounded-sm">
                    <h1>IOT</h1>
                    <p className="text-white">Google Home can't connect to school wifi, please connect Google Home to allow for actions</p>
                </div>
            </div>
        </>
    )
}

export default Dashboard