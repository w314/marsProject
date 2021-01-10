// immutable state
let store = Immutable.Map({
    // use immatable list for rover array
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    currentRover: 'Opportunity',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
});


// root identifiest the Element object we'll add our content to
const root = document.getElementById('root');

// setup a page loaded event listener
window.addEventListener('load', () => {

    // add click event listener to body
    document.body.addEventListener('click', handleClick);

    // after page loaded render content
    render(root, store);
});


/**
* @description Renders page
* @param {object} root - Element object to add innerHTML to
* @param {object} state - Immutable Map of state to pass to App function
*/
const render = async (root, state) => {
    root.innerHTML = App(state);
};


/**
* @description Returns page content
* @param {object} state - Immutable Map of state
* @returns {string} InnerHTML of root Element
*/
const App = (state) => {

    // get list of rovers, current rover and
    // and information about current rover from state
    const rovers = Array.from(state.get('rovers'));
    const currentRover = state.get('currentRover');
    const roverInfo = state.get(currentRover);

    // return page content
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
    `;
};


/**
* @description Updates state
* @param {string} property - Name of property to update
* @param {object} value - Value of property updated
*/
const updateStore = (property, value) => {

    // console.log(`-----  UPDATING STORE ------- with:`)
    // console.log(property)
    // console.log(value)

    // update store
    store = store.set(property, value);

    // render page
    render(root, store);
};


/**
* @description Handles click events
* @param {object} event - Event object
*/
const handleClick = (event) => {

    // only react to click events if rover selection radio buttons were clicked
    if (event.target.id === 'Spirit' || event.target.id === 'Opportunity' || event.target.id === 'Curiosity') {
        const newRover = event.target.id;
        updateCurrentRover(newRover);
    }
}


/**
* @description Updates current rover
* @param {string} newRover - Name of new currentRover
*/
const updateCurrentRover = (newRover) => {
    updateStore('currentRover', newRover);
}


/**
* @description Creates section of page where rovers can be selected
* @param {object} rovers - List of possible rovers
* @param {string} currentRover - Name of current rover shown
* @returns {string} Content of rover selection
*/
const selectRover = (rovers, currentRover) => {

    // create rover selection content
    const content = `
        <div class="rovers">
            ${radioButtons(rovers, currentRover)}
        </div>
    `

    // return content
    return content
};


/**
* @description Creates radioButtons
* @param {object} values - List of radio button values
* @param {string} valueSelected - Value to be shown as the checked radio button
* @returns {string} Content for radiobuttons created
*/
const radioButtons = (values, valueSelected) => {

    const radioButtons = values.reduce((content, value) => {
        // create radio button for each rover
        content += `<input type="radio" id="${value}" name="rover" value="${value}"`
        // if it's the current rover make it "checked"
        if (value === valueSelected) {
            content += ' checked';
        }
        content += `>${value}`;
        return content;
    }, '');

    return radioButtons;
};


/**
* @description Creates main content
* @param {string} currentRover - Name of rover displayed
* @param {object} roverInfo - Immutable Map of rover information
* @returns {string} Content to display
*/
const mainContent = (currentRover, roverInfo) => {

    // if a rover is active, it's photos are uploaded throughout the day
    // it's worth fetchings its data regularly
    // create variable to store current time
    const now = new Date();
    // set time period in milliseconds after which an active rover's information needs to be refreshed
    const refreshTime = 1000 * 60 * 15;
    // create boolean to determine if manifest is outdated
    const manifestOutDated =
        roverInfo &&
        roverInfo.get('manifest').get('status') === 'active' &&
        roverInfo.get('manifest').get('time_stamp') <= now.getTime() - refreshTime;


    // if information about rover is missing or if it's outdated request information again
    if (!roverInfo || manifestOutDated) {
        getRoverInfo(currentRover);
        // return message to indicate information is loading
        return '<p>Loading...</p>';
    }

    // if rover information is present return createMaincontent function
    return createMainContent(roverInfo);
};


/**
* @description Creates main content
* @param {object} roverInfo - Immutable Map of rover information
* @returns {string} Main content
*/
const createMainContent = (roverInfo) => {

    // get manifest and photos from roverInfo
    const manifest = roverInfo.get('manifest');
    const photos = Array.from(roverInfo.get('photos'));
    // information to display in mission details section
    const missionDetails = [
        {
            label: 'Launch date',
            value: manifest.get('launch_date'),
            class: 'manifestDate'
        },
        {
            label: 'Landing date',
            value: manifest.get('landing_date'),
            class: 'manifestData'
        },
        {
            label: 'Status',
            value: manifest.get('status'),
            class: ''
        }
    ];

    //return content
    return `
            <div class="manifest">
                <h2 class="roverName">${manifest.get('name')}</h2>
                ${aboutMission(missionDetails)}
            </div>
            <div class="roverImage">
                <img src="./assets/images/${manifest.get('name')}.jpg" height="10px" width="100%"/>
            </div>
        </section>
        <section class="roverPhotos">
            ${datingPhotos(manifest.get('status'), manifest.get('max_date'))}
            <div class="marsImages">
                ${marsPhotos(photos, imageTags)}
            </div>
        </section>
    `;
};

/**
* @description Creates content for mission details
* @param {object} missionDetails - List of detials to display
* @returns {string} Mission details content
*/
const aboutMission = (missionDetails) => {
    const content = missionDetails.reduce((content, detail) => {
        return content += `
           <p class="${detail.class}">
                <span class="manifestLabel">${detail.label}:</span>
                <span class="manifestData">${detail.value}</span>
            </p>
        `;
    }, '');
    return content;
}


/**
* @description Creates content with mars images
* @param {object} photos - List of photos rover captured on Mars
* @param {object} callback - Function to call to prepare image tags for content
* @returns {object} Function call
*/
const marsPhotos = (photos, callback) => {
    const className = 'marsImage';
    return callback(photos, className);
};


/**
* @description Creates HTML image tags from
* @param {object} sourceList - List of image sources
* @param {string} className - Name of class to add to image tags
* @returns {string} Image tags
*/
const imageTags = (sourceList, className) => {
    // generate image tags
    const images = sourceList.reduce((content, source) =>
        { return content += `<img class="${className}" src="${source}"/>`}, '');
    return images;
};


/**
* @description Create photo title
* @param {string} status - Status of current rover
* @param {string} max_date - Date of latest available photos
* @returns {string} Title of mars photos
*/
const datingPhotos = (status, max_date) => {
    // use different title for photos based on status of rover
    if (status === 'active') {
        return `
            <p class=imageTitle>latest photos available taken on ${max_date}</p>
        `;
    } else {
        return `
            <p class=imageTitle>this mission is compeleted </p>
            <p class=imageTitle>latest photos were taken on ${max_date}</p>
        `;
    }
}


// ------------------------------------------------------  API CALLS


/**
* @description Get rover information
* @param {string} rover - Name of rover to
*/
const getRoverInfo = (rover) => {
    // fetch information about rover
    const roverInfo = fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then(res => {
            // from fetched information preapre rover's manifest
            const date = new Date();
            const manifest = Immutable.Map({
                name: res.roverData.photo_manifest.name,
                launch_date: res.roverData.photo_manifest.launch_date,
                landing_date: res.roverData.photo_manifest.landing_date,
                status: res.roverData.photo_manifest.status,
                max_date: res.roverData.photo_manifest.max_date,
                time_stamp: date.getTime()
            });
            // create object with manifest property and return it
            return { manifest: manifest}
        })
        // fetch latest photos of rover
        .then(roverInfo => {
            // from received roverInfo get date of latest photos from manifest
            // const dateOfLatestPhotos = roverInfo.manifest.max_date;
            const dateOfLatestPhotos = roverInfo.manifest.get('max_date');
            // use date obtained to fetch latest photos
            fetch(`http://localhost:3000/roverPhotos/${rover}/${dateOfLatestPhotos}`)
                .then(res => res.json())
                .then(res => {
                    // collect imgage sources into array and
                    // add it to roverInfo object under photos property
                    roverInfo.photos =  Immutable.List(res.roverPhotos.photos.map((photo) => photo.img_src));
                    // update store with collected roverInfo
                    updateStore(rover, Immutable.Map(roverInfo));
                })
        })
        .catch(error  => {
            console.log(error)
        });
};