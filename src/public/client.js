let store = {
    user: { name: "Student" },
    apod: '',
    photos: '',
    roverShown: 'Curiosity',
    curiosity: '',
    opportunity: '',
    spirit: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
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
    let { rovers, roverShown, roverData, curiosity, apod, photos } = state
    // console.log(rovers)


    return `
        <header><h3>Choose Your Rover</h3></header>
        <main>
            ${Rovers(rovers, roverShown, store)}

            <section>
                ${AboutRover(roverShown, curiosity, store)}
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
                ${rovers}
                ${photosOfMars(photos)}
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

const Rovers = (rovers, roverShown, store) => {
    // console.log(`When making radio buttons roverShown: ${roverShown}`)
    let radioButtons = ''
    rovers.map(rover => {
        let radioButton = `<input type="radio" id="roverButtons" name="rover" value="${rover}" onClick="updateRover(event, store)"`
        if (rover === roverShown) {
            radioButton += ' checked'
        }
        radioButton += `>${rover}`
        radioButtons += radioButton
    })
    return radioButtons
}

const updateRover = (event, store) => {
    // updateSt
    roverShown = event.target.value;
    console.log(roverShown);
    updateStore(store, { roverShown });
}

const AboutRover = (roverShown, curiosity) => {
    if (!curiosity) {
        getRoverData(store)
    }

    let photos = curiosity.roverData.photo_manifest.photos
    console.log(`Total # of photos available: ${photos.length}`)
    const latestPhotoDate = curiosity.roverData.photo_manifest.max_date
    let latestPhotos = photos.filter(photo => photo.earth_date === latestPhotoDate)
    console.log(`Number of latest day photos: ${latestPhotos.length}`)

    return `
        <h2>About ${roverShown}</h2>
        <p>Launch date: ${curiosity.roverData.photo_manifest.launch_date}</p>
        <p>Landing date: ${curiosity.roverData.photo_manifest.landing_date}</p>
        <p>Status: ${curiosity.roverData.photo_manifest.status}</p>
        <p>Date of latest photos available: ${curiosity.roverData.photo_manifest.max_date}</p>
    `
        // <p>${curiosity.rover.photo_manifest.name}</p>
}


// const RoverImages = (latestPhotos) => {
//     let images = ''
//     latestPhotos.map(photos => images += <img src="`${photo.")
// }

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

const photosOfMars = (photos) => {
    // console.log(`Photos when entering marsPhotos: ${photos}`)
    if (!photos) {
        // console.log(`photos where empty calling getMarsPhotos`)
        getMarsPhotos(store)
    }
    // console.log(`Photos after getting mars pohtos: ${photos.photos.photos}`);
    return (`
        <p>Here are the mars photos</p>
        <p>${photos}</p>
        <p>${photos.photos.photos[0].id}</p>
    `)
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

const getMarsPhotos = (state) => {
    let { photos } = state
    console.log(`After setting phtots by state: ${photos}`)

    fetch(`http://localhost:3000/marsPhotos`)
        .then(res => {
            console.log(`response from marsPhotos: ${res}`)
            return res.json()})
        .then(photos => updateStore(store, { photos }))
}


const getRoverData = (state) => {
    const { roverShown } = state

    // fetch(`http://localhost:3000/${roverShown}`)
    fetch(`http://localhost:3000/curiosity`)
        .then(res => res.json())
        .then(curiosity => updateStore(store, { curiosity }))
}
