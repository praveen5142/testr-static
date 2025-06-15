/**
 * Fetches property data from the JSON file.
 * @returns {Promise<Array|null>} A promise that resolves to an array of property objects, or null on error.
 */
async function fetchProperties() {
    try {
        const response = await fetch('data/properties.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const properties = await response.json();
        return properties;
    } catch (error) {
        console.error("Could not fetch properties:", error);
        return null;
    }
}

/**
 * Generates HTML string for a single property card.
 * @param {object} property - The property object.
 * @returns {string} HTML string for the property card.
 */
function generatePropertyCardHTML(property) {
    const imageUrl = property.images && property.images.length > 0 ? property.images[0] : 'https://placehold.co/600x400/EEE/333?text=No+Image';
    // Added reveal-on-scroll class here
    return `
        <div class="property-card reveal-on-scroll" data-id="${property.id}">
            <img src="${imageUrl}" alt="${property.title}" class="property-card-img">
            <div class="property-card-body">
                <h3>${property.title}</h3>
                <p><strong>Price:</strong> ${property.price}</p>
                <p><strong>Size:</strong> ${property.size}</p>
                <p><strong>Location:</strong> ${property.location}</p>
                <a href="property-details.html?id=${property.id}" class="btn btn-secondary">View Details</a>
            </div>
        </div>
    `;
}

/**
 * Displays properties in the given container element.
 * @param {Array<object>} properties - Array of property objects.
 * @param {HTMLElement} containerElement - The HTML element to display properties in.
 */
function displayProperties(properties, containerElement) {
    if (!containerElement) {
        console.error("Property container element not found.");
        return;
    }
    containerElement.innerHTML = ''; // Clear existing content
    if (!properties || properties.length === 0) {
        containerElement.innerHTML = '<p>No properties found.</p>';
        return;
    }
    properties.forEach(property => {
        containerElement.innerHTML += generatePropertyCardHTML(property);
    });
    // Call revealOnScroll after new properties are added to the DOM,
    // especially if they might be immediately visible.
    revealOnScroll();
}

/**
 * Gets a property by its ID from an array of properties.
 * @param {string|number} id - The ID of the property to find.
 * @param {Array<object>} properties - Array of property objects.
 * @returns {object|null} The property object if found, otherwise null.
 */
function getPropertyById(id, properties) {
    if (!properties) return null;
    return properties.find(property => property.id === parseInt(id)) || null;
}

// --- Image Gallery / Slider Logic (for property-details.html) ---
let currentImageIndex = 0;
let propertyImages = []; // Stores images for the current property being detailed
let mainImageElement = null; // Reference to the main image element in the slider
let sliderThumbnails = []; // Array to hold thumbnail img elements

function showImage(index) {
    if (!mainImageElement || !propertyImages || propertyImages.length === 0) return;
    currentImageIndex = (index + propertyImages.length) % propertyImages.length; // Loop logic
    mainImageElement.src = propertyImages[currentImageIndex];

    // Update active thumbnail state
    sliderThumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle('active-thumbnail', idx === currentImageIndex);
    });
}

function nextImage() {
    showImage(currentImageIndex + 1);
}

function prevImage() {
    showImage(currentImageIndex - 1);
}

/**
 * Displays detailed information for a single property on the property details page.
 * Includes logic for image gallery/slider.
 * @param {object} property - The property object.
 * @param {object} DOMElements - An object containing references to DOM elements to populate.
 */
function displayPropertyDetails(property, DOMElements) {
    if (!property) {
        if (DOMElements.mainContainer) DOMElements.mainContainer.innerHTML = '<p class="text-center">Property details not found.</p>';
        return;
    }

    document.title = `${property.title} - Commercial Real Estate`; // Set page title

    if (DOMElements.titleElement) DOMElements.titleElement.textContent = property.title;
    if (DOMElements.locationElement) DOMElements.locationElement.textContent = property.location;

    // Image Gallery / Slider Implementation
    if (DOMElements.imageGallery) {
        DOMElements.imageGallery.innerHTML = ''; // Clear any placeholder
        currentImageIndex = 0; // Reset for current property
        propertyImages = property.images || []; // Set global for current property's images
        sliderThumbnails = []; // Reset thumbnails array

        if (propertyImages.length > 0) {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            const mainImageContainer = document.createElement('div');
            mainImageContainer.className = 'slider-main-image-container';
            mainImageElement = document.createElement('img');
            mainImageElement.alt = property.title + " main image";
            mainImageElement.className = 'slider-main-image';
            mainImageContainer.appendChild(mainImageElement);
            sliderContainer.appendChild(mainImageContainer);

            if (propertyImages.length > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'slider-button prev';
                prevBtn.innerHTML = '&laquo;';
                prevBtn.onclick = prevImage;
                sliderContainer.appendChild(prevBtn);

                const nextBtn = document.createElement('button');
                nextBtn.className = 'slider-button next';
                nextBtn.innerHTML = '&raquo;';
                nextBtn.onclick = nextImage;
                sliderContainer.appendChild(nextBtn);

                const thumbnailsDiv = document.createElement('div');
                thumbnailsDiv.className = 'slider-thumbnails mt-1';
                propertyImages.forEach((imgUrl, index) => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = imgUrl;
                    thumbImg.alt = `${property.title} thumbnail ${index + 1}`;
                    thumbImg.onclick = () => showImage(index);
                    thumbnailsDiv.appendChild(thumbImg);
                    sliderThumbnails.push(thumbImg);
                });
                sliderContainer.appendChild(thumbnailsDiv);
            }
            DOMElements.imageGallery.appendChild(sliderContainer);
            showImage(0);
        } else {
            DOMElements.imageGallery.innerHTML = `<img src="https://placehold.co/800x500/EEE/333?text=No+Image+Available" alt="No Image Available" style="width:100%; border-radius: 5px;">`;
        }
    }

    if (DOMElements.infoGridContainer) {
        DOMElements.infoGridContainer.innerHTML = `
            <p><strong>Price:</strong> ${property.price}</p>
            <p><strong>Size:</strong> ${property.size}</p>
            <p><strong>Type:</strong> ${property.type}</p>
            <p><strong>Status:</strong> ${property.status}</p>
            <p><strong>Developer:</strong> ${property.developer}</p>
            <p><strong>City:</strong> ${property.city}</p>
        `;
    }
    if (DOMElements.descriptionElement) DOMElements.descriptionElement.textContent = property.description;
    if (DOMElements.amenitiesList) {
        DOMElements.amenitiesList.innerHTML = '';
        if (property.amenities && property.amenities.length > 0) {
            property.amenities.forEach(amenity => {
                const li = document.createElement('li');
                li.textContent = amenity;
                DOMElements.amenitiesList.appendChild(li);
            });
        } else {
            DOMElements.amenitiesList.innerHTML = '<li>No specific amenities listed.</li>';
        }
    }
}

// --- Scroll Animation ---
function revealOnScroll() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            el.classList.add('is-visible');
        }
    });
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    const propertiesData = await fetchProperties();
    if (!propertiesData) {
        console.log("Failed to load properties data. Page functionality might be limited.");
        const listingsContainer = document.getElementById('property-listings-container');
        if (listingsContainer) {
            listingsContainer.innerHTML = '<p class="text-center error-message">Sorry, we were unable to load property listings at this time. Please try again later.</p>';
        }
        const propertyDetailContainer = document.getElementById('property-detail-main-content');
        if (propertyDetailContainer && !new URLSearchParams(window.location.search).has('id')) {
             propertyDetailContainer.innerHTML = '<p class="text-center error-message">Sorry, we were unable to load property data. Please try again later.</p>';
        }
        return;
    }

    const listingsContainer = document.getElementById('property-listings-container');
    if (listingsContainer) {
        displayProperties(propertiesData, listingsContainer);
    }

    const propertyDetailContainer = document.getElementById('property-detail-main-content');
    if (propertyDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const propertyId = params.get('id');

        const DOMElements = {
            mainContainer: propertyDetailContainer,
            titleElement: document.getElementById('property-title'),
            locationElement: document.getElementById('property-location'),
            imageGallery: document.getElementById('property-image-gallery-dynamic'),
            infoGridContainer: document.getElementById('property-info-grid-dynamic'),
            descriptionElement: document.getElementById('property-description-dynamic'),
            amenitiesList: document.getElementById('property-amenities-list-dynamic')
        };

        if (propertyId) {
            const property = getPropertyById(propertyId, propertiesData);
            if (property) {
                displayPropertyDetails(property, DOMElements);
            } else {
                DOMElements.mainContainer.innerHTML = `<p class="text-center lead mt-2">Property with ID ${propertyId} not found.</p>`;
            }
        } else if (window.location.pathname.includes('property-details.html')) {
             DOMElements.mainContainer.innerHTML = '<p class="text-center lead mt-2">No property ID provided to display details.</p>';
        }
    }

    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);
});
