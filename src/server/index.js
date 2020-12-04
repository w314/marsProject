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

app.get('/marsPhotos', async (req, res) => {
	try {
		console.log('trying to get mars photos')
		let photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2015-6-3&api_key=sUHsXIwebQ2Yztzj2DILp5goJaMM5QQBWhhp3Q7v`)
		.then(res => res.json())
		// 	console.log(res.json())
		// 	return res.json()})
		res.send({ photos })
		// .then(data => console.log(data))
	} catch (err) {
		console.log('error:', err)
	}
})

app.get('/curiosity', async (req, res) => {
	try {
		let roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity/?api_key=sUHsXIwebQ2Yztzj2DILp5goJaMM5QQBWhhp3Q7v`)
		.then(res => res.json())
		res.send({ roverData })
	} catch (err) {
		console.log('error:', err)
	}
})