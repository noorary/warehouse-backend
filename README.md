# Pre-assignment: simple warehouse web app

This is a solution for Reaktor's assignment for junior developers.

> Your client is a clothing brand that is looking for a simple web app to use in their warehouses. To do their work efficiently, the warehouse workers need a fast and simple listing page per product category, where they can check simple product and availability information from a single UI.

More info about the task [here](https://www.reaktor.com/junior-dev-assignment/).

# My solution

![ui picture](https://github.com/noorary/warehouse/blob/master/imgs/UI.png?raw=true)
## Project structure and reasoning behind some choices made

Project has two parts: simple UI-frontend and more complex custom API. I decided to build own implementation of the API to work around some issues with the legacy api.

### Backend

My API-implementation provides data in better format and faster than legacy API. Backend uses node-cron to schedule data-fetching, which is done every 5 minutes. This is same time as the legacy API's internal cache. Instead of caching results in my API-implementation, I used scheduled tasks to provide data always on time for client. This way there's not so many long waiting times on the client-side while backends fetches and combines data from two different, buddy APIs. 

### Frontend

Frontend repository can be found [here](https://github.com/noorary/warehouse).

Frontend is quite simple React.js app with three buttons to choose product type/category and table to list results. It gets data from my own API with axios.get-requests and uses Bootstrap for component styling.

Frontend has longish startup time when starting app for the first time, but once both frontend and backend heroku-apps are a awake, it works reasonably fast.

## Known issues and future todo's

* Backend service could work better with legacy API's availability data. Now failing request to legacy api or failure in id mathcing results for 'not-available' value for some manufacturer's products in my API implementation.
* Backend should be divided into different files
* Frontend could be prettier, but this was not priority for the assignment.