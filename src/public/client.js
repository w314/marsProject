let store = {
    // user: { name: "Student" },(
    // apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRover: 'Opportunity',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {

    // console.log(`Old state:\n ${store.photos}`)
    // console.log(`Old state:`)
    // console.log(store)
    console.log(`-----  UPDATING STORE ------- with new state`)
    console.log(newState);
    store = Object.assign(store, newState)
    // console.log(`Updated state:\n${store.photos}`)
    // console.log(`Updated state:`)
    // console.log(store)
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
        <main>
            <section class="selectionAndManifestAndImage">
                <div class="selectRover">
                    <h2 class="selectRoverTitle">select rover</h2>
                    ${selectRover(state)}
                </div>
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
    }, '<div class="rovers">')

    // return content
    return content
}


const updateRover = (event, state) => {
    currentRover = event.target.value;
    console.log(currentRover);
    updateStore(state, { currentRover });
}


const mainContent = (state) => {

    // get current rover
    const rover = state.currentRover;

    // if a rover is active, it's photos are uploaded throughout the day
    // it's worth fetchings its data regularly
    // create variable to store current time
    const now = new Date()
    // set time period in milliseconds after which an active rover's information is refreshed
    const refreshTime = 1000 * 60 * 15;
    // create boolean to determine if manifest is outdated
    const manifestOutDated =
        state[rover] &&
        state[rover].manifest.status === 'active' &&
        state[rover].manifest.time_stamp <= now.getTime() - refreshTime

    // if information about rover is missing or if it's outdated request information again
    if (!state[rover] || manifestOutDated) {
        // request rover information
        getRoverInfo(rover)
        .then(res => {
            // update store with information received
            const newState = {[rover] : res}
            updateStore(state, newState)
        })
    }

    // return content created
    return createMainContent(state[rover])
}



const createMainContent = (roverInfo) => {

    const { manifest, photos } = roverInfo

    // generate image tags
    const images = photos.reduce((content, photo) =>
        // {return content += `<img class="marsImage" src="${photo.img_src}" height="350px" width="100%"/>`}, '')
        {return content += `<img class="marsImage" src="${photo.img_src}"/>`}, '')

    console.log(`images: ${images}`)

    return `
            <div class="manifest">
                <h2 class="roverName">${manifest.name}</h2>
                <p class="manifestDate">
                    <span class="manifestLabel">Launch date:</span>
                    <span class="manifestData">${manifest.launch_date}</span>
                </p>
                <p class=manifestDate>
                    <span class="manifestLabel">Landing date:</span>
                    <span class="manifestData">${manifest.landing_date}</span>
                </p>
                <p>
                    <span class="manifestLabel">Status:</span>
                    <span class="manifestData">${manifest.status}</span>
                </p>
            </div>
            <div class="roverImage">
                <img src="./assets/images/${manifest.name}.jpg" height="10px" width="100%"/>
            </div>
        </section>
        <section class="roverPhotos">
            <p class=imageTitle>latest photos available taken on ${manifest.max_date}</p>
            <div class="marsImages">
                ${images}
            </div>
        </section>
    `
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
            const date = new Date();
            const manifest = {
                name: res.roverData.photo_manifest.name,
                launch_date: res.roverData.photo_manifest.launch_date,
                landing_date: res.roverData.photo_manifest.landing_date,
                status: res.roverData.photo_manifest.status,
                max_date: res.roverData.photo_manifest.max_date,
                time_stamp: date.getTime()
            }
            return { manifest: manifest}
        })
        // .then(res => res.json())
        .then(roverInfo => {
            // console.log(roverInfo)
            const dateOfLatestPhotos = roverInfo.manifest.max_date;
            // console.log(`date of latest photos: ${dateOfLatestPhotos}`)
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
            // console.log(`Our rover is: ${rover}`)
            // console.log(roverInfo)
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
    // console.log(photodate.getDate(), today.getDate());

    // console.log(photodate.getDate() === today.getDate());
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