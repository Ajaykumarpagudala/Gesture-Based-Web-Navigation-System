// JavaScript code to generate hotel information dynamically
// Function to generate hotel information
let arr=['','',''];
function generateHotelInfo(id,name, image, rent, description) {
    window.location.href = 'hotel_info_templae.html#' + encodeURIComponent(JSON.stringify({
        id:id,
        name: name,
        image: image,
        rent: rent,
        description: description
    }));
}
/*function gesture(){
    const socket = io('http://127.0.0.1:5000');
    socket.on('connect', function() {
        socket.emit('run_gesture');
    });
    socket.on('response', function(data) {
        alert(data.message);
    });
}*/
/*function gesture() {
    document.getElementById('gestureDemoModal').style.display = 'block';
}*/

function closeGestureDemo() {
    document.getElementById('gestureDemoModal').style.display = 'none';
    // Optionally, establish the socket connection here after the demo is closed
    // const socket = io('http://127.0.0.1:5000');
    // ... rest of your socket code ... 
    const socket = io('http://127.0.0.1:5000');
    socket.on('connect', function() {
        socket.emit('run_gesture');
    });
    socket.on('response', function(data) {
        alert(data.message);
    });
}

let currentGestureIndex = 0;
const gestureInstructions = [
    "Raise left index finger to rotate left",
    "Raise right index finger to rotate right ",
    "Thumbs up right to zoom in.",
    "Thumbs up left to zoom out",
    "Show V symbol with right hand to rotate top",
    "Show V symbol with left hand to rotate bottom",
    "pinch to exit the gesture",
];
const gestureimages= [
    "images/ILimg.jpg",
    "images/Iimg.jpg",
    "images/thumbimg.jpg",
    "images/thumbLimg.jpg",
    "images/Vimg.jpg",
    "images/VLimg.jpg",
    "images/pinch.jpg",
];

function showGesture(index) {
    // Get the element where you want to display the gesture instructions
    const gestureInstructionElement = document.getElementById('gestureImage'); 
    const gestureimg=document.getElementById('gesture');
    // Update the content of the element with the gesture instruction at the current index
    gestureInstructionElement.textContent = gestureInstructions[index];
    gestureimg.src=gestureimages[index];
    gestureimg.style.height='400px';
    gestureimg.style.width='auto';
    gestureimg.style.display='block';
    currentGestureIndex = index;
}

function gesture() {
    showGesture(currentGestureIndex);
    document.getElementById('gestureDemoModal').style.display = 'block';
}

function previousGesture() {
    currentGestureIndex = (currentGestureIndex - 1 + gestureInstructions.length) % gestureInstructions.length;
    showGesture(currentGestureIndex);
}

function nextGesture() {
    currentGestureIndex = (currentGestureIndex + 1) % gestureInstructions.length;
    showGesture(currentGestureIndex);
}

function skipGestureDemo() {
    closeGestureDemo();
}


function panaroma1(image){
    // Create a single panoramic image object
    const panorama = new PANOLENS.ImagePanorama(image);
    // Select the HTML element where the panorama will be displayed
    let imageContainer = document.querySelector('.large-image');
    // Initialize the panorama viewer with desired settings
    const viewer = new PANOLENS.Viewer({
        container: imageContainer,
        autoRotate: false,
        autoRotateSpeed: 1,
        controlBar: true,
    });
    viewer.add(panorama);
    }
    window.onload = function() {
        var data = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
        var a=data.name;
        const storedArr=localStorage.getItem('hotelInfo');
        if(storedArr){
            arr=JSON.parse(storedArr);
            a=arr[data.id];
        }
        document.title = a + " - Hotel Information"; // Set the title using the hotel name
        console.log(arr);
        document.getElementById('hotel-name').textContent = a; // Update the hotel name content
        panaroma1(data.image);
        var guests = Math.floor(Math.random() * 5) + 1;
        var bedrooms = Math.floor(Math.random() * 5) + 1;
        var beds = Math.floor(Math.random() * 5) + 1;
        var bathrooms = Math.floor(Math.random() * 5) + 1;
        var descriptionSubstring = a.split(',')[1].trim();
        var updatedDescription = "Entire Villa in " + descriptionSubstring;
        var details= guests + " guests. " + bedrooms + " bedroom. " + beds + " beds. " + bathrooms + " bathrooms";
        document.getElementById('details').textContent=details;
        document.getElementById('hotel-description').textContent = updatedDescription;
        document.getElementById('hotel-rent').textContent = "₹"+data.rent+"  /  night";
        rent=data.rent;
        let x=data.rent*5;
        document.getElementById('nights').textContent="₹"+data.rent+"x5nights"+"\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0₹"+x;
        document.getElementById('charge').textContent="InnSight service fee"+"\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0₹"+data.rent/5;
        const hotelname = data.name;
        const descriptionElement = document.getElementById('description');
        
        // Apply bold font style to the hotel name
        const boldHotelName = `<span style="font-weight: bold;">${hotelname}</span>`;
        
        // Construct the description HTML with the styled hotel name
        const descriptionHTML = [`
            Relax with the whole family at this peaceful place to stay. 
            Tucked away in the quiet corner of a scenic, quaint, charming place at 
            ${boldHotelName} - Well preserved cultural heritage of the place is a 
            20th Century home with ${bedrooms} bedrooms and ${bathrooms} washrooms, pool, and private spaces. 
            ${boldHotelName} promises to deliver a memorable experience by retaining 
            the simplicity and warmth of the home while delivering you the luxuries of the modern world.
        `,`Experience the ultimate getaway at ${boldHotelName} Nestled amidst lush greenery, this serene retreat offers ${bedrooms} spacious bedrooms, with ${bathrooms} bathroom. With a private pool and tranquil surroundings, ${boldHotelName} promises a rejuvenating escape from the hustle and bustle of everyday life.`
        ];
        const randomDescription = descriptionHTML[Math.floor(Math.random() * descriptionHTML.length)];
        descriptionElement.innerHTML = randomDescription;
    }
    async function reserve() {
        const checkIn = document.getElementById('check-in').value;
        const checkOut = document.getElementById('check-out').value;
        const guests = document.getElementById('guests').value;
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const response = await fetch('http://localhost:5000/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ check_in: checkIn, check_out: checkOut, guests: guests,rent:rent,isloggedIN:isLoggedIn})
        });
    
        if (!response.ok) {
            const errorResult = await response.json();
            alert(errorResult.message);
            return;
        }    
        const result = await response.json();
        alert(result.message);
    }
        let currentImageIndex = 0;
        const images = [
            "1.jpeg.webp",
            "2.jpeg.webp",
            "3.jpeg.webp",
            // Add more image filenames as needed
        ];
    
        function showImage(index) {
            document.getElementById('hotel-image').src = images[index];
            currentImageIndex = index;
        }
    
        function previousImage() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            showImage(currentImageIndex);
        }
    
        function nextImage() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            showImage(currentImageIndex);
        }
async function login(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),  // Send credentials as JSON
                });

                if (response.ok) {
                    // Handle successful login, redirect to dashboard
                    const data = await response.json();
                    if(data.redirect){
                        localStorage.setItem('loggedIn','true');
                    window.location.href = data.redirect;
                    }
                    else {
                    
                    window.location.href='login.html';
                    }  // Redirect to the desired page
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    alert(errorData.message);  // Show error message
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
        async function adminlogin(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/adminlogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),  // Send credentials as JSON
                });

                if (response.ok) {
                    // Handle successful login, redirect to dashboard
                    const data = await response.json();
                    if(data.redirect){
                        localStorage.setItem('adminloggedIn','true');
                    window.location.href = data.redirect;
                    }
                    else {
                    
                    window.location.href='adminlogin.html';
                    }  // Redirect to the desired page
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    alert(errorData.message);  // Show error message
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        } 
        async function signup(event) {
            event.preventDefault(); // Prevent the default form submission
        
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
        
            try {
                const response = await fetch('http://localhost:5000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username:username, email:email, password:password }), // Send user data as JSON
                });
        
                const data = await response.json();
        
                if (response.ok) {
                    // Handle successful signup
                    alert(data.message); // Show success message
                } else {
                    // Handle errors
                    alert(data.message); // Show error message
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.'); // Show generic error message
            }
        }
        function updateUIBasedOnLoginStatus() {
            const login2 = document.getElementById('login1');
            const signup3 = document.getElementById('signup1');
            const logout4 = document.getElementById('logout');
            
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        
            // Update button visibility based on login status
            if (isLoggedIn) {
                if (login2) login2.style.display = 'none';
                if (signup3) signup3.style.display = 'none';
                if (logout4) logout4.style.display = 'block';
            } else {
                if (login2) login2.style.display = 'block';
                if (signup3) signup3.style.display = 'block';
                if (logout4) logout4.style.display = 'none';
            }
        }
        
        // Call this function on page load
        document.addEventListener('DOMContentLoaded', updateUIBasedOnLoginStatus);
        function logout() {
                if(localStorage.getItem('loggedIn')=='true'){
                    localStorage.removeItem('loggedIn');
                    window.location.href='login.html';
                }
                else if(localStorage.getItem('adminloggedIn')=='true'){
                    localStorage.removeItem('adminloggedIn');
                    window.location.href='adminlogin.html';
                }
                updateUIBasedOnLoginStatus(); 
        }

        //updating based on the search destinations

        function search(){
            // Get the selected destination value
            event.preventDefault();
            const destination = document.getElementById('destination').value;
            const checkin=document.getElementById('checkindate').value;
            const checkout=document.getElementById('checkoutdate').value;
            if(checkin==='' || checkout===''){
                alert('checkin and checkout dates are required');
                return;
            }
            const inp=new Date(checkin);
            const out=new Date(checkout);
            const today=new Date();
            today.setHours(0,0,0,0);
            if(inp<today || out<today || inp>out){
                alert('enter a valid dates');
                return;
            }

            // Map destinations to three separate image URLs
            const imageMap = {
                "Hyderabad":[
                    {img:"images/hyd1.jpg",name:"Falaknuma Palace, Hyderabad"},
                    {img:"images/hyd2.jpg",name:"ITC Kohenur, Hyderabad"},
                    {img:"images/hyd4.webp",name:"Hayatt Hotel, Hyderabad"}
                ],
                "Bengaluru": [
                    {img:"images/bg4.jpg",name:"City Center Hotel, Bengaluru"},
                    {img:"images/bg2.jpg",name:"Carter Resorts, Bengaluru"},
                    {img:"images/bg3.webp",name:"GreenField Hotel, Bengaluru"}
                ],
                "Chennai": [
                    {img:"images/ch1.jpg",name:"Hayatt Hotel, Chennai"},
                    {img:"images/ch2.jpg",name:"ITC Grand Hotel, Chennai"},
                    {img:"images/ch4.jpg",name:"Holiday Inn Hotel, Chennai"}
                ],
                "Mumbai": [
                    {img:"images/mum6.avif",name:"Taj Hotel, Mumbai"},
                    {img:"images/mum5.jpg",name:"ITC Maratha, Mumbai"},
                    {img:"images/mum4.webp",name:"Country Mariott Hotel, Mumbai"}
                ]
            };
            // Get references to the three image elements
            const img1 = document.getElementById('img1');
            const img2 = document.getElementById('img2');
            const img3 = document.getElementById('img3');
            const heading1=document.getElementById('heading1');
            const heading2=document.getElementById('heading2');
            const heading3=document.getElementById('heading3');

            // Update the src attributes of the three images based on the selected destination
            if (destination && imageMap[destination]) {
                img1.src = imageMap[destination][0].img;
                img2.src = imageMap[destination][1].img;
                img3.src = imageMap[destination][2].img;
                heading1.innerHTML=imageMap[destination][0].name;
                arr[0]=imageMap[destination][0].name;
                heading2.innerHTML=imageMap[destination][1].name;
                arr[1]=imageMap[destination][1].name;
                heading3.innerHTML=imageMap[destination][2].name;
                arr[2]=imageMap[destination][2].name;
                localStorage.setItem('hotelInfo',JSON.stringify(arr));

                img1.style.display="block";
                img2.style.display="block";
                img3.style.display="block";
            }
            console.log(arr);
        }