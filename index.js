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

// let gloves = [
//   {
//     id: '6fc2b18b4318d02d8e',
//     type: 'gloves',
//     name: 'GINJAEK SHINE',
//     color: [
//       'blue'
//     ],
//     price: 76,
//     manufacturer: 'abiplos'

//   }
// ]

app.get('/', (req, res) => {
  res.send('Custom API for warehouse-data')
})

app.get('/products/:item', async (req, res) => {
  try {
    const searchTerm = req.params.item
    console.log(searchTerm)
    client.get(searchTerm, async (err, products) => {
      if (err) throw err

      if (products) {
        res.status(200).send({
          products: JSON.parse(products)
        })
      } else {
        const products = await axios.get(`https://bad-api-assignment.reaktor.com/v2/products/${searchTerm}`)
        client.setex(searchTerm, 600, JSON.stringify(products.data))
        res.status(200).send({
          products: products.data,
          message: 'cache miss'
        })
      }
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

const port = 5000

app.listen(port, () => console.log(`Backend running on port ${port}`))