// set up immutable store
let store = Immutable.Map({
    // use immatable list for rover array
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    currentRover: 'Opportunity',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
})


// add our markup to the page
const root = document.getElementById('root')

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {

    // add click event listener to body
    document.body.addEventListener('click', (event, store) => {
        // TODO send store to handleClick

        // console.log(`body was clicked`)
        handleClick(event, store)}
    );

    render(root, store)
})


const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {

    const rovers = Array.from(state.get('rovers'))
    const currentRover = state.get('currentRover')
    const roverInfo = state.get(currentRover);

    return `
        <main>
            <section class="selectionAndManifestAndImage">
                <div class="selectRover">
                    <h2 class="selectRoverTitle">select rover</h2>
                    ${selectRover(rovers, currentRover)}
                </div>
                ${mainContent(currentRover, roverInfo)}
        </main>
        <footer></footer>
    `
}


const updateStore = (property, value) => {

    // console.log(`Old store:`)
    // console.log(store)

    console.log(`-----  UPDATING STORE ------- with:`)
    console.log(property)
    console.log(value)

    store = store.set(property, value);
    // console.log(`updated store`)
    // console.log(store)

    render(root, store)
}



// ------------------------------------------------------  COMPONENTS


const handleClick = (event, store) => {
    // console.log(`event in handleClick`)
    // console.log(event.target.id)

    // const rovers = Array.from(store.get('rovers'));
    // console.log(rovers)

    if (event.target.id === 'Spirit' || event.target.id === 'Opportunity' || event.target.id === 'Curiosity') {
    // if (rovers.indexOf(event.target.id) != -1) {
        const newRover = event.target.id;
        updateCurrentRover(newRover);
    }
}


const updateCurrentRover = (newRover) => {
    updateStore('currentRover', newRover);
}


const selectRover = (rovers, currentRover) => {

    // create rover selection content
    const content = rovers.reduce((content, rover, index, array) => {
        // create radio button for each rover
        content += `<input type="radio" id="${rover}" name="rover" value="${rover}"`
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



const mainContent = (currentRover, roverInfo) => {

    // if a rover is active, it's photos are uploaded throughout the day
    // it's worth fetchings its data regularly
    // create variable to store current time
    const now = new Date()
    // set time period in milliseconds after which an active rover's information needs to be refreshed
    const refreshTime = 1000 * 60 * 15;
    // create boolean to determine if manifest is outdated
    const manifestOutDated =
        roverInfo &&
        roverInfo.manifest.status === 'active' &&
        roverInfo.manifest.time_stamp <= now.getTime() - refreshTime


    // if information about rover is missing or if it's outdated request information again
    if (!roverInfo || manifestOutDated) {
        getRoverInfo(currentRover)
        // return message to indicate information is loading
        return 'Loading...'
    }

    // if rover information is present return createMaincontent function
    return createMainContent(roverInfo)
}



const createMainContent = (roverInfo) => {

    // console.log(`incoming roverInfo`);
    // console.log(roverInfo)

    const { manifest, photos } = roverInfo

    // const manifest = roverInfo.get('manifest');
    // const photos = roverInfo.get('photos');

    // console.log(`manifest and photos`)
    // console.log(manifest)
    // console.log(photos)

    // generate image tags
    const images = photos.reduce((content, photo) =>
        // { return content += `<img class="marsImage" src="${photo.get('img_src')}"/>`}, '')
        { return content += `<img class="marsImage" src="${photo}"/>`}, '')


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
            ${datingPhotos(manifest.status, manifest.max_date)}
            <div class="marsImages">
                ${images}
            </div>
        </section>
    `
    // return `
    //         <div class="manifest">
    //             <h2 class="roverName">${manifest.get('name')}</h2>
    //             <p class="manifestDate">
    //                 <span class="manifestLabel">Launch date:</span>
    //                 <span class="manifestData">${manifest.get('launch_date')}</span>
    //             </p>
    //             <p class=manifestDate>
    //                 <span class="manifestLabel">Landing date:</span>
    //                 <span class="manifestData">${manifest.get('landing_date')}</span>
    //             </p>
    //             <p>
    //                 <span class="manifestLabel">Status:</span>
    //                 <span class="manifestData">${manifest.get('status')}</span>
    //             </p>
    //         </div>
    //         <div class="roverImage">
    //             <img src="./assets/images/${manifest.get('name')}.jpg" height="10px" width="100%"/>
    //         </div>
    //     </section>
    //     <section class="roverPhotos">
    //         ${datingPhotos(manifest.get('status'), manifest.get('max_date'))}
    //         <div class="marsImages">
    //             ${images}
    //         </div>
    //     </section>
    // `
            // <p class=imageTitle>latest photos available taken on ${manifest.get('max_date')}</p>
}


// created this function to satisfy requirement for creating dynamic content using an if statment
const datingPhotos = (status, max_date) => {
    if (status === 'active') {
        return `
            <p class=imageTitle>latest photos available taken on ${max_date}</p>
        `
    } else {
        return `
            <p class=imageTitle>this mission is compeleted </p>
            <p class=imageTitle>latest photos were taken on ${max_date}</p>
        `
    }
}




// ------------------------------------------------------  API CALLS




const getRoverInfo = (rover) => {
    const roverInfo = fetch(`http://localhost:3001/rover/${rover}`)
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
        .then(roverInfo => {
            // console.log(`roverinfo before photos`)
            // console.log(roverInfo)
            const dateOfLatestPhotos = roverInfo.manifest.max_date;
            fetch(`http://localhost:3001/roverPhotos/${rover}/${dateOfLatestPhotos}`)
                .then(res => res.json())
                .then(res => {
                    roverInfo.photos = res.roverPhotos.photos.map((photo) => photo.img_src);
                    // console.log(`roverinfo after adding photos`)
                    // console.log(roverInfo)
                    updateStore(rover, roverInfo)
                })
        })
}


// UDACITY EXAMPLES
// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3001/apod`)
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