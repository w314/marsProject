const store = Immutable.Map({
    // use immatable list for rover array
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    currentRover: 'Opportunity',
    Spirit: '',
    Curiosity: '',
    Opportunity: '',
})


const currentRover = store.get('currentRover')
console.log(`current rover: ${currentRover}`)