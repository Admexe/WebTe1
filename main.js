let gallery = document.getElementById("gallery");
let filter = document.getElementById("filter");
let modal = document.getElementById("myGalleryModal"); // Updated ID
let modalImg = document.getElementById("modalImg");
let modalCaption = document.getElementById("modalCaption"); // Updated ID
let isPresentationRunning = false;
let currentIndex = 0;
let intervalId;

filter.addEventListener('input', (event) => {
    let searchString = event.target.value.toLowerCase();
    let photos = Array.from(gallery.children);

    photos.forEach(photo => {
        if (!photo.alt.toLowerCase().includes(searchString)) {
            photo.style.display = "none";
        } else {
            photo.style = "";
        }
    });
});

function getImages() {
    return fetch('./images.json').then(response => {
        if (response.ok) {
            return response.json();
        }
        return null;
    }).then(result => {
        if (result != null) {
            result.images.forEach((img, index) => {
                let thumbnail = document.createElement('img');
                thumbnail.src = img.url;
                thumbnail.alt = img.description;
                thumbnail.classList.add('thumbnail');
                thumbnail.addEventListener('click', () => openModal(index, result));


                gallery.appendChild(thumbnail);
            });
        } else {
            console.error("response is empty");
        }
        function updateCaption() {
            const { description, timestamp } = result.images[currentIndex];
            modalCaption.innerHTML = `<p>${description}</p><p>Timestamp: ${timestamp}</p>`;
        }
        
     
        
        function nextImage() {
            currentIndex = (currentIndex + 1) % result.images.length;
            modalImg.src = result.images[currentIndex].url;
            updateCaption(result);
        }
        
        function prevImage() {
            currentIndex = (currentIndex - 1 + result.images.length) % result.images.length;
            modalImg.src = result.images[currentIndex].url;
            updateCaption(result);
        }
        
        function startPresentation(result) {
            if (isPresentationRunning) {
                clearInterval(intervalId);
            } else {
                intervalId = setInterval(() => {
                    nextImage(result);
                }, 2000); // Change the time interval as needed (currently set to 2 seconds)
            }
            
            isPresentationRunning = !isPresentationRunning;
        }
        document.getElementById("prevbtn").addEventListener("click", prevImage);
        document.getElementById("nextbtn").addEventListener("click", nextImage);
        document.getElementById("presentationbtn").addEventListener("click", startPresentation);
    });
}

function openModal(index, result) {
    modal.style.display = "block";
    modalImg.src = result.images[index].url;
    currentIndex = index;
    updateCaption(result);
}
function closeModal() {
    modal.style.display = "none";
    clearInterval(intervalId);
}



getImages();
