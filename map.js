
mapboxgl.accessToken = 'pk.eyJ1IjoieHByYXNrYWMiLCJhIjoiY2xwZHZ3cDI5MTN3aTJrbmtpbm0xdXU1MSJ9.07-WNYPcdcDD61-zeY3ZKg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [19.487978057775337,48.67848154980625],
    zoom: 6
});
console.log("Map loaded");

async function fetchMarkerData() {
    try {
        const response = await fetch('./images.json'); 

        if (!response.ok) {
            throw new Error('Failed to fetch marker data');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}



async function createMarkers() {
    const markerData = await fetchMarkerData();

    if (markerData && markerData.images) {
        // Sort images based on timestamp in ascending order
        const sortedImages = markerData.images.sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

            waypoints = sortedImages.map(image => {
            return `${+image.location.lng},${+image.location.lat}`;
        });

        console.log('Ordered Waypoints:', waypoints);
        
        const groupedImages = {};
        markerData.images.forEach(image => {
            const { location } = image;
            const key = `${location.lat}_${location.lng}`;

            if (!groupedImages[key]) {
                groupedImages[key] = [];
            }

            groupedImages[key].push(image);
        });

        Object.keys(groupedImages).forEach(key => {
            const images = groupedImages[key];

            const marker = new mapboxgl.Marker()
                .setLngLat([images[0].location.lat, images[0].location.lng])
                .addTo(map);

            marker.getElement().addEventListener('click', () => {
                openModal(images);
            });
        });
    }
}




function openModal(images) {
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = '';

    if (images.length > 1) {
        images.forEach(image => {
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = 'custom image';
            img.classList.add('popup-image');

            img.addEventListener('click', () => {
                openImageDetailsModal(image);
            });

            modalContent.appendChild(img);
        });
    } else if (images.length === 1) {
        const image = images[0];

        const img = document.createElement('img');
        img.src = image.url;
        img.alt = 'custom image';
        img.classList.add('popup-image');

        img.addEventListener('click', () => {
            openImageDetailsModal(image);
        });

        modalContent.appendChild(img);
    }

    modal.style.display = 'block';

    const closeModalButton = document.getElementsByClassName('close')[0];
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}












async function createRoute(images) {
    // Extract coordinates from marker data
    const coordinates = images.map(image => [
        image.location.lat,
        image.location.lng
    ]);

    // Fetch directions from the Mapbox Directions API
    const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.join(';')}?access_token=${mapboxgl.accessToken}`
    );

    // Parse the API response
    const data = await response.json();

    // Check if the API response contains a valid route
    if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        // Extract the route geometry from the API response
        const routeGeometry = data.routes[0].geometry;

        // Create a GeoJSON LineString feature
        const route = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: polyline.decode(routeGeometry).map(coord => [coord[1], coord[0]])
            }
        };

        // Check if the route source already exists and remove it before adding a new one
        if (map.getSource('route')) {
            removeRoute();
        }

        // Add the GeoJSON source to the map
        map.addSource('route', {
            type: 'geojson',
            data: route
        });

        // Add a new layer to the map to visualize the route
        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5
            }
        });
    } else {
        console.error('Invalid or missing route data in the API response');
    }
}


function removeRoute() {
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
    }
}

const showRouteButton = document.getElementById('toggleRouteButton');
showRouteButton.addEventListener('click', async () => {
    const markerData = await fetchMarkerData(); // Add await here
    if (markerData && markerData.images) {
        const sortedImages = markerData.images.sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        if (map.getSource('route')) {
            removeRoute();
        } else {
            createRoute(sortedImages);
        }
    }
});















createMarkers();

function openImageDetailsModal(image) {
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = ''; 

    const img = document.createElement('img');
    img.src = image.url;
    img.alt = 'custom image';
    img.classList.add('popup-image');

    modalContent.appendChild(img);

    const textContainer = document.createElement('div');
    textContainer.style.margin = '10px 0';
    textContainer.style.color = '#ccc';
    textContainer.style.textAlign = 'center';
    textContainer.style.fontSize = '15px';
    textContainer.style.letterSpacing = '1px';

    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = `Description: ${image.description}`;
    textContainer.appendChild(descriptionParagraph);
    
    const timestampParagraph = document.createElement('p');
    timestampParagraph.textContent = `Timestamp: ${image.timestamp}`;
    textContainer.appendChild(timestampParagraph);
    
    const nameParagraph = document.createElement('p');
    nameParagraph.textContent = `Name: ${image.name}`;
    textContainer.appendChild(nameParagraph);
    
    if (image.location) {
        const locationParagraph = document.createElement('p');
        locationParagraph.textContent = `Location: ${image.location.lat}, ${image.location.lng}`;
        textContainer.appendChild(locationParagraph);
    }
    

    modalContent.appendChild(textContainer);

    modal.style.display = 'block';

    const closeModalButton = document.getElementsByClassName('close')[0];
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

}

