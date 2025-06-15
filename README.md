# Commercial Real Estate Showcase Website

This is a static website designed to showcase commercial real estate properties. It features a modern, responsive design with animations and dynamically loaded property data.

## Features

*   Homepage with featured properties and calls to action.
*   Property listings page with (placeholder) data for properties in Delhi, Gurgaon, and Noida.
*   Detailed property view with an image gallery and comprehensive information.
*   About Us and Contact Us pages.
*   Responsive design for optimal viewing on desktops, tablets, and mobiles.
*   Engaging animations and hover effects.
*   Scroll-reveal animations for content.

## How to View

1.  Clone this repository or download the files.
2.  Navigate to the project's root directory.
3.  Open the `index.html` file in your web browser.

## Data Source

The property data is currently sourced from a static JSON file: `data/properties.json`. This file contains placeholder data for demonstration purposes.

### Original Scraping Attempt

A Python script (`scripts/scraper.py`) was developed to scrape data from [https://properties.cityinfoservices.com/](https://properties.cityinfoservices.com/). However, due to challenges in reliably extracting all necessary fields (like property type, size, and accurate price) without direct DOM inspection capabilities, placeholder data was used for the final website build. The scraper requires `requests` and `beautifulsoup4`.

## Technologies Used

*   HTML5
*   CSS3 (with Flexbox and Grid for layout)
*   JavaScript (for dynamic content loading, image gallery, and animations)
