require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3001

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        const image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
        // .then(res => console.log(res))
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Mars Project App listening on port ${port}!`))

app.get('/roverPhotos/*', async (req, res) => {

	console.log(`Request path: ${req.path}`);
	const rover = req.path.slice(13,-11)
	const date = req.path.slice(-10,);

	try {
		const roverPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
		.then(res => res.json())
		res.send({ roverPhotos })
	} catch (err) {
		console.log('error:', err)
	}
})

app.get('/rover/*', async (req, res) => {
	try {
		const rover = req.path.slice(7,);
		console.log(`Request path: ${req.path}`);
		const roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}/?api_key=${process.env.API_KEY}`)
		.then(res => res.json())
		res.send({ roverData })
	} catch (err) {
		console.log('error:', err)
	}
})