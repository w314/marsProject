let store = {
    // user: { name: "Student" },(
    // apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRover: 'Spirit',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {

    // console.log(`Old state:\n ${store.photos}`)
    console.log(`Old state:`)
    console.log(store)
    console.log(`updating store with new state`)
    console.log(newState);
    store = Object.assign(store, newState)
    // console.log(`Updated state:\n${store.photos}`)
    console.log(`Updated state:`)
    console.log(store)
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


const mainContent = (state) => {
    console.log(`state in mainContent:`)
    console.log(state)

    const rover = state.currentRover;

    // if (state[rover]) {
    //     console.log(`max_date: ${state[rover].manifest.max_date}` )
    //     console.log(`max earth_date: ${state[rover].photos[0].earth_date}`)
    //     const photosOutDated = state[rover] && state[rover].manifest.max_date > state[rover].photos[0].earth_date
    //     console.log(`photos are outdated: ${photosOutDated}`)
    // }
    const photosOutDated = state[rover] && state[rover].manifest.max_date > state[rover].photos[0].earth_date

    if (!state[rover]) {
        // const content = getRoverInfo(rover)
        getRoverInfo(rover)
        // .then(res => res.json())
        .then(res => {
            // console.log(`returned from getRoverInfo: ${res.manifest.name}`)
            const newState = {[rover] : res}
            // console.log(`new state: ${newState.Spirit.manifest.name}`)
            updateStore(state, newState)
            // return state[rover]
        })
    // } else if (photosOutDated) {
    //     const
    } else {
        return createMainContent(state[rover]);
    }

    console.log(`roverInfo before colling createMainContent:`)
    console.log(state[rover])

    createMainContent(state[rover])
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
    console.log(`Main content in createMainContent before returning: ${content}`)
    return content
}




// ------------------------------------------------------  API CALLS




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