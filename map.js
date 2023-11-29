
mapboxgl.accessToken = 'pk.eyJ1IjoieHByYXNrYWMiLCJhIjoiY2xwZHZ3cDI5MTN3aTJrbmtpbm0xdXU1MSJ9.07-WNYPcdcDD61-zeY3ZKg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
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



createMarkers();

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

