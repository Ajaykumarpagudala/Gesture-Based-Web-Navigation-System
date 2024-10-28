// Create a single panoramic image object
const panorama = new PANOLENS.ImagePanorama('images/2.jpg');

// Select the HTML element where the panorama will be displayed
let imageContainer = document.querySelector('.large-image');

// Initialize the panorama viewer with desired settings
const viewer = new PANOLENS.Viewer({
    container: imageContainer,
    autoRotate: true,
    autoRotateSpeed: 5,
    controlBar: true,
});

// Add only the single panorama to the viewer
viewer.add(panorama);
