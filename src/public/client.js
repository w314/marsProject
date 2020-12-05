let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRover: 'Curiosity',
    CuriosityManifest: '',
    CuriocityPhotos: '',
    OpportunityManifest: '',
    OpportunityPhotos: '',
    SpiritManifest: '',
    SpiritPhotos: '',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    // console.log(`Old state:\n ${store.photos}`)
    console.log(`updating store with new state`)
    console.log(newState);
    store = Object.assign(store, newState)
    // console.log(`Updated state:\n${store.photos}`)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, currentRover, roverData, curiosity, apod, photos } = state
    // console.log(rovers)


    return `
        <header><h3>Choose Your Rover</h3></header>
        <main>
            ${Rovers(rovers, currentRover, store)}

            <section>
                ${roverInfo(store)}
                ${photosOfMars(state)}
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
+            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

const Rovers = (rovers, currentRover, store) => {
    // console.log(`When making radio buttons currentRover: ${currentRover}`)
    let radioButtons = ''
    rovers.map(rover => {
        let radioButton = `<input type="radio" id="roverButtons" name="rover" value="${rover}" onClick="updateRover(event, store)"`
        if (rover === currentRover) {
            radioButton += ' checked'
        }
        radioButton += `>${rover}`
        radioButtons += radioButton
    })
    return radioButtons
}


const updateRover = (event, store) => {
    currentRover = event.target.value;
    console.log(currentRover);
    updateStore(store, { currentRover });
}



const roverInfo = (state) => {

    // get current rover from state
    const { currentRover } = state;

    // create variable to refer to current rover's Manifest
    const manifestKey = currentRover + 'Manifest'

    // if current Rover's manifest doesn't exist request the information
    if (!state[manifestKey]) {
        getRoverData(state)
    } else {
        // if rover is active and the date of the latest photos taken is not today
        // request the information again
        const manifest = state[manifestKey].roverData.photo_manifest;
        const status = manifest.status;
        const dateOfLatestPhotos = manifest.max_date;
        const today = new Date();
        if (status === 'active' && dateOfLatestPhotos <= today.getDate()) {
            getRoverData(state)
        }
    }

    // get manifest from state
    const manifest = state[manifestKey].roverData.photo_manifest;

    // return page content
    return `
        <h2>${currentRover}</h2>
        <p>Launch date: ${manifest.launch_date}</p>
        <p>Landing date: ${manifest.landing_date}</p>
        <p>Status: ${manifest.status}</p>
        <p>Date of latest photos available: ${manifest.max_date}</p>
    `
}


// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}


const photosOfMars = (state) => {

    // get current rover from state
    const { currentRover } = state;

    // create variable to refer to current rover's photos
    const photosKey = currentRover + 'Photos';

    // if there are no photos stored request the information
    if (!state[photosKey]) {
        getRoverPhotos(state)
    } else {
        // if the date of the photos stored is earlier then the latest photos taken
        // request the photos again
        const manifestKey = currentRover + 'Manifest';
        const dateOfLatestPhotos = state[manifestKey].roverData.photo_manifest.max_date;
        const dateOfPhotosStored = state[photosKey].roverPhotos.photos[0].earth_date;
        console.log(`Date of Photos stored: ${dateOfPhotosStored}`)
        if (dateOfPhotosStored < dateOfLatestPhotos) {
            getRoverPhotos(state)
        }
    }

    // variable to store array of photos
    console.log(photosKey);
    const photos = state[photosKey].roverPhotos.photos

    // variable to store content
    let content = `
        <p>Here are the mars photos</p>
    `
    // go through all the photos in photos array and add picture to content
    photos.map(photo => content += `<img src="${photo.img_src}" height="350px" width="100%"/>`)

    // return content
    return content
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

const getRoverPhotos = (state) => {
    const { currentRover } = state;
    const manifestKey = currentRover + 'Manifest';
    const dateOfLatestPhotos = state[manifestKey].roverData.photo_manifest.max_date;

    fetch(`http://localhost:3000/roverPhotos/${currentRover}/${dateOfLatestPhotos}`)
        .then(res => {
            return res.json()
        })
        .then(photos => {
            switch(currentRover) {
                case 'Curiosity': {
                    CuriosityPhotos = photos;
                    updateStore(state, { CuriosityPhotos });
                    break;
                }
                case 'Opportunity': {
                    OpportunityPhotos = photos;
                    updateStore(state, { OpportunityPhotos })
                    break;
                }
                case 'Spirit': {
                    SpiritPhotos = photos;
                    updateStore(state, { SpiritPhotos });
                    break;
                }
            }
        })
}


const getRoverData = (state) => {
    const { currentRover } = state

    // fetch(`http://localhost:3000/${currentRover}`)
    fetch(`http://localhost:3000/rover/${currentRover}`)
        .then(res => res.json())
        .then(manifest => {
            switch(currentRover) {
                case 'Curiosity': {
                    CuriosityManifest = manifest
                    updateStore(state, { CuriosityManifest })
                    break;
                }
                case 'Opportunity': {
                    OpportunityManifest = manifest;
                    updateStore(state, { OpportunityManifest })
                    break;
                }
                case 'Spirit': {
                    SpiritManifest = manifest;
                    updateStore(state, { SpiritManifest });
                    break;
                }

            }
        })
}
