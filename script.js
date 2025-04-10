const video = document.querySelector('.video-container')

async function fetchData(location) {
    const input = document.querySelector('input')
    const appContainer = document.querySelector('.app-container')
    try {

        const res = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=uk&key=NNEVJKGX4JH6T48QH4BPLLQWH&contentType=json`);
        const errorSpan = document.querySelector('.error-span');
        if (errorSpan) {
            errorSpan.remove();
        }
        if (!res.ok) {
            throw new Error('Request Failed!')
        }

        const data = await res.json();

        return data;
    } catch (error) {


        const span = document.createElement('span')
        span.style.opacity = 0
        span.className = 'error-span absolute transition-opacity duration-1000 ease-in-out'
        appContainer.style.opacity = 0
        console.log('Error: ' + error);
        helperFunctions.setWeatherVideo('space', () => {
            video.style.opacity = 1;
        });
        setTimeout(() => {

            span.style.opacity = 1
            span.textContent = "Oops! We can't find that location!"
            input.parentElement.parentElement.appendChild(span)
        }, 1200)
    }
}


// Create async to fulfil data promise to have access to the data. I do not want to use .then().

async function displayData(location) {
    const iconifyImg = document.querySelector('.iconify')
    const temperature = document.querySelector('h1')
    const h2 = document.querySelector('h2')
    const humidity = document.querySelector('.percentage')
    const windSpeed = document.querySelector('.kmph')
    const conditionText = document.querySelector('.condition-text')
    const countryLocation = document.querySelector('.country')
    const appContainer = document.querySelector('.app-container')



    try {
        const weatherData = await fetchData(location);
        const currentConditions = weatherData.currentConditions
        const currentWeather = currentConditions.conditions.split(', ')[0].toLowerCase()

        if (weatherData) {
            appContainer.style.opacity = 0
            video.style.opacity = 0

            setTimeout(() => {
                const country = weatherData.resolvedAddress.split(", ")
                iconifyImg.innerHTML = `<img class="text-white" src="./assets/icons/${currentConditions.icon}.svg" alt="${currentConditions.icon} icon" style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(360deg) brightness(100%) contrast(100%);">`;
                conditionText.textContent = currentConditions.conditions
                temperature.innerHTML = `${currentConditions.temp}&deg;`
                h2.textContent = helperFunctions.capitaliseFirstLetter(weatherData.address)
                countryLocation.textContent = helperFunctions.capitaliseFirstLetter(country[1])

                humidity.textContent = `${currentConditions.humidity}%`

                windSpeed.textContent = currentConditions.windspeed + ' km/h'
                appContainer.style.opacity = 1
                // Pass in anonymous callback function here to set opacity once video has loaded
                helperFunctions.setWeatherVideo(currentWeather, () => {
                    video.style.opacity = 1;
                });
                console.log(currentConditions)
            }, 1000)


        } else throw new Error('Request Failed')

    } catch (error) {
        console.log('Error: ' + error);

    }
};





const helperFunctions = (function () {

    function capitaliseFirstLetter(word) {
        if (!word || typeof word !== 'string') return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    function getInputValue() {
        const input = document.querySelector('input')

        if (input && input.value) {
            console.log(input.value)
            return input.value
        }

        return ''
    }

    function setWeatherVideo(currentCondition, callback) {
        const video = document.querySelector('video')
        // Used a callback here so that video-opacity can be set once the video has loaded
        video.onloadeddata = () => callback();
        const weather = {
            clear: ['clear', 'sunny'],
            cloudy: ['cloudy', 'overcast', 'partially cloudy'],
            foggy: ['fog', 'mist', 'haze'],
            hail: ['hail', 'hailing'],
            overcast: ['wind', 'breezy', 'windy', 'overcast'],
            rain: ['rain', 'showers', 'raining'],
            snow: ['snow', 'sleet', 'flurries', 'snowing'],
            thunder: ['thunder', 'tstorm'],
            space: ['space']
        }

        let isMatch
        for (const [cat, conditions] of Object.entries(weather)) {
            conditions.some(cond => {
                const isMatched = cond.includes(currentCondition);

                if (isMatched) {
                    isMatch = cat;

                }
                return isMatched;
            });

        }

        try {
            if (isMatch) {
                const videoPath = `assets/videos/${isMatch}.mp4`;
                // Check if video file exists
                fetch(videoPath, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            video.src = videoPath;
                        } else {
                            throw new Error('Video file not found');
                        }
                    });
            } else {
                throw new Error('No matching weather condition found');
            }
        } catch (error) {
            console.error('Error setting weather video:', error);
            // Fallback to a default video if needed
            video.src = 'assets/videos/clear.mp4';
        }

    }



    return {
        capitaliseFirstLetter,
        getInputValue,
        setWeatherVideo

    };

})();

const setEventListeners = (() => {
    function init() {
        const btn = document.querySelector('button');
        const input = document.querySelector('input');

        btn.addEventListener('click', () => {

            displayData(helperFunctions.getInputValue());
        });

        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {

                displayData(helperFunctions.getInputValue());
            }
        });
    }

    return {
        init
    };
})();


document.addEventListener('DOMContentLoaded', function () {
    setEventListeners.init()
    displayData('london')
})