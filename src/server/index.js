require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        // let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
        // let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`)
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=sUHsXIwebQ2Yztzj2DILp5goJaMM5QQBWhhp3Q7v`)
            .then(res => res.json())
        res.send({ image })
        // .then(res => console.log(res))
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/roverPhotos/*', async (req, res) => {

	console.log(`Request path: ${req.path}`);
	const rover = req.path.slice(13,-11)
	const date = req.path.slice(-10,);

	try {
		let roverPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=sUHsXIwebQ2Yztzj2DILp5goJaMM5QQBWhhp3Q7v`)
		.then(res => res.json())
		res.send({ roverPhotos })
	} catch (err) {
		console.log('error:', err)
	}
})

app.get('/rover/*', async (req, res) => {
	try {
		const rover = req.path.slice(7,);
		console.log(rover)
		let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}/?api_key=sUHsXIwebQ2Yztzj2DILp5goJaMM5QQBWhhp3Q7v`)
		.then(res => res.json())
		res.send({ roverData })
	} catch (err) {
		console.log('error:', err)
	}
})