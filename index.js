const express = require('express')
const axios = require('axios')
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const redisPort = 6379
const client = redis.createClient(redisPort)

client.on('error', (err) => {
  console.log(err)
})

app.get('/', (req, res) => {
  const response = ' Custom API for warehouse-data'
  res.send(response)
})


// get products 
app.get('/products/:item', async (req, res) => {

  let retry = 0
  availa

  try {
    const searchTerm = req.params.item
    console.log(searchTerm)

    client.get(searchTerm, async (err, products) => {
      if (err) throw err

      // products are in cache, return from there
      if (products) {
        res.status(200).send({
          products: JSON.parse(products)
        })

        // products are not in cahce, get from legacy api
      } else {
        const products = await axios.get(`https://bad-api-assignment.reaktor.com/v2/products/${searchTerm}`)

        // try again if data is empty -> send error if after 3 tries data is still empty
        while (products.data.length === 0) {
          if (retry <= 3) {
            retry++
            products = await axios.get(`https://bad-api-assignment.reaktor.com/v2/products/${searchTerm}`)
          } else {
            res.status(503).send('Error: could not fetch data')
            break
          }
        }

        // if products were fetched succesfully, send data and success as a response

        client.setex(searchTerm, 600, JSON.stringify(products.data))

        res.status(200).send({
          products: products.data,
          message: 'cache miss'
        })
      }
    })
  } catch (err) {
    if (err.response) {
      // request was send succesfully, but recieved an error response
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (err.request) {
      // response was never received or request never left
      console.log(error.request)
    } else {
      // something weird happened
      console.log('Error', error.message)
    }
    res.status(500).send({ message: err.message })
  }
})

// get availability

const getAvailability = async (manufacturer) => {
  const availability = await axios.get(`https://bad-api-assignment.reaktor.com/v2/availability/${searchTermManu}`)
  let availabilityArray = []
  availability.data.response.forEach(element => {
    const instock = element.DATAPAYLOAD
    availabilityArray.push({id: element.id, instock: instock})
  })
  console.log(availabilityArray)

  return availabilityArray
}

app.get('/availability/:manufacturer', async (req, res) => {

  // let retry = 0

  try {
    const searchTermManu = req.params.manufacturer
    console.log(searchTermManu)
    client.get(searchTermManu, async (err, availability) => {
      if (err) throw err

      if (availability) {
        res.status(200).send({
          availabilities: JSON.parse(availability)
        })
      } else {
        const availability = await axios.get(`https://bad-api-assignment.reaktor.com/v2/availability/${searchTermManu}`)

        // try again if data is empty -> send error if after 3 tries data is still empty
        while (availability.data.length === 0) {
          if (retry <= 3) {
            retry++
            availability = await axios.get(`https://bad-api-assignment.reaktor.com/v2/availability/${searchTermManu}`)
          } else {
            res.status(503).send('Error: could not fetch data')
            break
          }
        }

        // if products were fetched succesfully, send data and success as a response

        let availabilityArray = []
        availability.data.response.forEach(element => {
          let temp = element.DATAPAYLOAD.split('<INSTOCKVALUE>')
          let temp2 = temp[1].split('</INSTOCKVALUE>')
          let instock = temp2[0]
          availabilityArray.push({id: element.id, instock: instock})
        })

        client.setex(searchTermManu, 600, JSON.stringify(availabilityArray))

        res.status(200).send({
          availabilities: availabilityArray,
          message: 'cache miss'
        })
      }
    })
  } catch (err) {
    if (err.response) {
      // request was send succesfully, but recieved an error response
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (err.request) {
      // response was never received or request never left
      console.log(error.request)
    } else {
      // something weird happened
      console.log('Error', error.message)
    }
    res.status(500).send({ message: err.message })
  }
})



const port = 5000

app.listen(port, () => console.log(`Backend running on port ${port}`))
