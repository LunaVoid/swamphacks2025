import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import Navbar from './components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';

function Dashboard() {
    const [UserLocation, setUserLocation] = useState({});
    const [Weather, setWeather] = useState('');
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const [videoUrl, setVideoUrl] = useState(null);
    const [update, setUpdate] = useState(0);
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

    }, [update]);

    useEffect(() => {
        if (UserLocation.latitude && UserLocation.longitude) {
            getWeather(UserLocation.latitude, UserLocation.longitude);
        }
    }, [UserLocation]);

    const getWeather = async (lat, long) => {
        console.log(lat, long)
        const url = `https://api.weather.gov/points/${lat},${long}`;
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
            setWeather(forecastData.properties.periods[0].detailedForecast);
        }
        catch (error) {

        };

    };
    

    return (
        <>
            {isAuthenticated}
            <Navbar/>
            <div className="grid grid-cols-6 grid-rows-7 gap-4 min-h-screen">
                <div className="col-span-4 col-start-2 text-center border-2 rounded-sm">DashBoard</div>
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
                <div className="col-span-2 row-span-2 col-start-4 row-start-2 text-center border-2 rounded-sm">Fire Probability</div>
                <div className="col-span-4 row-span-2 col-start-2 row-start-4 text-center border-2 rounded-sm">
                    <h1>Weather</h1>
                    <p className="text-white">{Weather}</p>

                </div>
                <div className="col-span-4 row-span-2 col-start-2 row-start-6 text-center border-2 rounded-sm">
                    <h1>IOT</h1>
                    <p className="text-white">Google Home can't connect to school wifi</p>
                </div>
            </div>
        </>
    )
}

export default Dashboard