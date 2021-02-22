const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const cors = require('cors')
const cron = require('node-cron')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// --- placeholder arrays for products ---

let glovesArray = []
let facemasksArray = []
let beaniesArray = []

// --- scheduled funcs to get data from legacy api ---
cron.schedule('*/5 * * * *', async function () {
  console.log('running task to get gloves');
  const temp = await getGloves()
  glovesArray = temp
})

cron.schedule('*/5 * * * *', async function () {
  console.log('running a task to get facemasks');
  const temp = await getFacemasks()
  facemasksArray = temp
})

cron.schedule('*/5 * * * *', async function () {
  console.log('running a task to get beanies');
  const temp = await getBeanies()
  beaniesArray = temp
})

// --- data-fetching for gloves ---
getGloves = async () => {

  console.log('hanskat alkaa')
  console.log(new Date())

  let response
  response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/gloves')
  if(response.data.length < 2) {
    response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/gloves')
  }
  const gloves = response.data

  const manus = [...new Set(gloves.map(item => item.manufacturer))]
  console.log(manus)

  const availability = await getAvailability(manus)

  for (let i = 0; i < gloves.length; i++) {
    var id = gloves[i].id.toUpperCase()
    const avail = availability.filter(function (obj) {
      return obj.id === id
    })

    if (avail.length === 0) {
      gloves[i] = {
        ...gloves[i],
        instock: 'not_available'
      }
      continue
    } else {
      var temp = avail[0].DATAPAYLOAD.split('<INSTOCKVALUE>')
      var temp2 = temp[1].split('</INSTOCKVALUE>')
      let instockValue = temp2[0]
      gloves[i] = {
        ...gloves[i],
        instock: instockValue
      }
    }
  }
  console.log('hanskat valmiina')
  console.log(new Date())
  return gloves
}



// --- data-fetching for facemasks ---
getFacemasks = async () => {

  const availability = await getAvailability()

  let response
  response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/facemasks')
  if(response.data.length < 2) {
    response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/facemasks')
  }
  const facemasks = response.data

  for (let i = 0; i < facemasks.length; i++) {
    var id = facemasks[i].id.toUpperCase()
    const avail = availability.filter(function (obj) {
      return obj.id === id
    })

    if (avail.length === 0) {
      facemasks[i] = {
        ...facemasks[i],
        instock: 'not_available'
      }
      continue
    } else {
      var temp = avail[0].DATAPAYLOAD.split('<INSTOCKVALUE>')
      var temp2 = temp[1].split('</INSTOCKVALUE>')
      let instockValue = temp2[0]
      facemasks[i] = {
        ...facemasks[i],
        instock: instockValue
      }
    }
  }
  return facemasks
}

// --- data-fetching for beanies ---
getBeanies = async () => {

  const availability = await getAvailability()

  let response
  response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/beanies')
  if(response.data.length < 2) {
    response = await axios.get('https://bad-api-assignment.reaktor.com/v2/products/beanies')
  }
  const beanies = response.data

  for (let i = 0; i < beanies.length; i++) {
    var id = beanies[i].id.toUpperCase()
    const avail = availability.filter(function (obj) {
      return obj.id === id
    })

    if (avail.length === 0) {
      beanies[i] = {
        ...beanies[i],
        instock: 'not_available'
      }
      continue
    } else {
      var temp = avail[0].DATAPAYLOAD.split('<INSTOCKVALUE>')
      var temp2 = temp[1].split('</INSTOCKVALUE>')
      let instockValue = temp2[0]
      beanies[i] = {
        ...beanies[i],
        instock: instockValue
      }
    }
  }
  return beanies
}


// --- data-fetching for stock-values ---
getAvailability = async (manus) => {
  let result = []

  for(let i=0; i<manus.length;i++) {
    const type = manus[i]
    console.log(type)
    let prod = await axios.get(`https://bad-api-assignment.reaktor.com/v2/availability/${type}`)
    if (prod.data.response < 2) prod = await axios.get(`https://bad-api-assignment.reaktor.com/v2/availability/${type}`)
    if(prod.data.response === undefined) {
      continue
    } else {
      result = [...result, ...prod.data.response]
    }
    
  }
  return result
}

app.get('/', (req, res) => {
  const response = ' Custom API for warehouse-data'
  res.send(response)
})

// --- HTTP - route ---
app.get('/products/:item', async (req, res) => {
  const type = req.params.item
  console.log(type)

  let products 

  if (type === 'facemasks') {
    // const temp = await getFacemasks()
    // facemasksArray = temp
    products = facemasksArray
  } else if (type === 'gloves') {
    // const temp = await getGloves()
    // glovesArray = temp
    products = glovesArray
  } else if(type === 'beanies') {
    // const temp = await getBeanies()
    // beaniesArray = temp
    products = beaniesArray
  } else {
    res.status(400).send('Error: item is invalid')
  }

  res.status(200).json({
    products: products
  })

})

// --- ---
const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Backend running on port ${port}`))