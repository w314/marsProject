let store = {
    // user: { name: "Student" },(
    // apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRover: 'Spirit',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
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
    console.log(`updating store with new state`)
    console.log(newState);
    store = Object.assign(store, newState)
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
        <header>
            <h2 class="selectRoverTitle">select rover</h2>
            ${selectRover(state)}
        </header>
        <main>
            ${mainContent(state)}
        </main>
        <footer></footer>
    `
                // <p>Here is an example section.</p>
            // <section>
            //     ${roverManifest(state)}
            // </section>
            // <section>
            //     ${roverPhotos(state)}
            // </section>
                // <p>
                //     One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                //     the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                //     This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                //     applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                //     explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                //     but generally help with discoverability of relevant imagery.
                // </p>
                // ${ImageOfTheDay(apod)}
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS


const selectRover = (state) => {

    // get array of rovers and current rover from state
    const { rovers, currentRover } = state


    // create rover selection content
    const content = rovers.reduce((content, rover, index, array) => {
        // create radio button for each rover
        content += `<input type="radio" id="roverButtons" name="rover" value="${rover}" onClick="updateRover(event, store)"`
        // if it's the current rover make it "checked"
        if (rover === currentRover) {
            content += ' checked';
        }
        content += `>${rover}`;
        // if it's the last rover in the array ad the closing </div> tag
        if (index === array.length-1) {
            content += `</div>`
        }
        return content;
    }, '<div class="selectRover">')

    // return content
    return content
}


const updateRover = (event, state) => {
    currentRover = event.target.value;
    console.log(currentRover);
    updateStore(state, { currentRover });
}


const mainContent = async (state) => {
// async function mainContent(state) {
    console.log(`state in mainContent:`)
    console.log(state)

    const rover = state.currentRover;

    if (!state[rover]) {
        const content = await getRoverInfo(rover)
        // .then(res => res.json())
        .then(res => {
            console.log(`returned from getRoverInfo: ${res.manifest.name}`)
            const newState = {[rover] : res}
            console.log(`new state: ${newState.Spirit.manifest.name}`)
            updateStore(state, newState)
            return state[rover]
        })
        // .then(roverInfo => createMainContent(roverInfo))
        .then(roverInfo =>
        {
            const c = createMainContent(roverInfo)
            console.log(`just got main content: `)
            console.log(c)
            return c
        })
        // .then(re)

        console.log(`content before returning: `)
        console.log(content)
        return content.toString()
    }



    // console.log(`rover in state after calling getRoverInfo:`)
    // console.log(state)
    // console.log(typeOf(state[rover]))

    // return createMainContent(state[rover])
}

const createMainContent = (roverInfo) => {

    console.log(`roverInfo in createMainContent:`)
    console.log(roverInfo)

    const { manifest, photos } = roverInfo

    console.log(`Photos: `)
    console.log(photos)

    // generate image tags
    const images = photos.reduce((content, photo) => {return content += `<img src="${photo.img_src}" height="350px" width="100%"/>`}, '')

    content = `
        <section>
            <h2>${manifest.name}</h2>
            <div>
                <p>Launch date: ${manifest.launch_date}</p>
                <p>Landing date: ${manifest.landing_date}</p>
                <p>Status: ${manifest.status}</p>
            </div>
        </section>
        <section>
            <div class="roverPhotos">
                <p>these are the latest photos available taken on ${manifest.max_date}.</p>
                ${images}
            </div>
        </section>

        <p>szia</p>
    `
    console.log(`Main content: ${content}`)
    return content
}

const roverManifest = (state) => {

    // get current rover from state
    const { currentRover } = state;

    // create variable to refer to current rover's Manifest
    const manifestKey = currentRover + 'Manifest'

    // if current Rover's manifest doesn't exist request the information
    if (!state[manifestKey]) {
        getRoverManifest(state)
    } else {
        // if rover is active and the date of the latest photos taken is not today
        // request the information again
        const manifest = state[manifestKey].roverData.photo_manifest;
        // const manifest = state[manifestKey]
        const status = manifest.status;
        const dateOfLatestPhotos = manifest.max_date;
        const today = new Date();
        if (status === 'active' && dateOfLatestPhotos <= today.getDate()) {
            getRoverManifest(state)
        }
    }

    // get manifest from state
    // const manifest = state[manifestKey].roverData.photo_manifest;
    const manifest = state[manifestKey]

    // return page content
    return `
        <h2>${currentRover}</h2>
        <div>
            <p>Launch date: ${manifest.launch_date}</p>
            <p>Landing date: ${manifest.landing_date}</p>
            <p>Status: ${manifest.status}</p>
        </div>
        <div>
        </div>
    `
}




const roverPhotos = (state) => {

    // get current rover from state
    const { currentRover } = state;

    // create variable to refer to current rover's photos
    const photosKey = currentRover + 'Photos';

    // get date of latest available photos
    const manifestKey = currentRover + 'Manifest';
    // const dateOfLatestPhotos = state[manifestKey].roverData.photo_manifest.max_date;
    const dateOfLatestPhotos = state[manifestKey].max_date;

    // if there are no photos stored request the information
    if (!state[photosKey]) {
        getRoverPhotos(state)
    } else {
        // if the date of the photos stored is earlier then the latest photos taken
        // request the photos again
        const dateOfPhotosStored = state[photosKey].roverPhotos.photos[0].earth_date;
        if (dateOfPhotosStored < dateOfLatestPhotos) {
            getRoverPhotos(state)
        }
    }

    // variable to store array of photos
    // const photos = state[photosKey].roverPhotos.photos
    const photos = state[photosKey].roverPhotos.photos

    // generate image tags
    const images = photos.reduce((content, photo) => {return content += `<img src="${photo.img_src}" height="350px" width="100%"/>`}, '')


    // return content
    return `
        <div class="roverPhotos">
                <p>these are the latest photos available taken on ${dateOfLatestPhotos}.</p>
                ${images}
        </div>
    `
}

// ------------------------------------------------------  API CALLS

const getRoverManifest = (rover) => {
    // const { currentRover } = state

    fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then(manifest => {
        // .then(res => {

            // const manifest = {
            //     name: res.roverData.photo_manifest.name,
            //     launch_date: res.roverData.photo_manifest.launch_date,
            //     landing_date: res.roverData.photo_manifest.landing_date,
            //     max_date: res.roverData.photo_manifest.max_date
            // }

            // console.log(`max date: ${manifest.max_date}`)

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


const getRoverPhotos = (state) => {
    const { currentRover } = state;
    console.log(`Current Rover: ${currentRover}`)
    const manifestKey = currentRover + 'Manifest';
    const dateOfLatestPhotos = state[manifestKey].roverData.photo_manifest.max_date;
    // const dateOfLatestPhotos = state[manifestKey].max_date;
    console.log(`dateOfLatestPhotos: ${dateOfLatestPhotos}` )

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


const getRoverInfo = (rover) => {
    // const rover =  state.currentRover;

    // const roverInfo = state[rover];
    // console.log(`rover object in state: ${rover}`)
    // if (!roverInfo) {
    const roverInfo = fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then(res => {
            const manifest = {
                name: res.roverData.photo_manifest.name,
                launch_date: res.roverData.photo_manifest.launch_date,
                landing_date: res.roverData.photo_manifest.landing_date,
                max_date: res.roverData.photo_manifest.max_date
            }
            return { manifest: manifest}
        })
        // .then(res => res.json())
        .then(roverInfo => {
            // console.log(roverInfo)
            const dateOfLatestPhotos = roverInfo.manifest.max_date;
            console.log(`date of latest photos: ${dateOfLatestPhotos}`)
            const roverData = fetch(`http://localhost:3000/roverPhotos/${rover}/${dateOfLatestPhotos}`)
            .then(res => res.json())
            .then(res => {
                roverInfo.photos = res.roverPhotos.photos
                // console.log(roverInfo)
                return roverInfo
            })
            return roverData
        })
        .then(roverInfo => {
            console.log(`Our rover is: ${rover}`)
            console.log(roverInfo)
            // const newState = {[rover]: roverInfo}
            // console.log(newState)
            return roverInfo
            // updateStore(state, newState)
        })

    return Promise.resolve(roverInfo)
    // .then(res => mainContent())
}


// UDACITY EXAMPLES
// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

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