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

## How to View (Now as a Spring Boot Application)

This project is now packaged as a Spring Boot application, which serves the static website content.

1.  **Prerequisites:**
    *   Java Development Kit (JDK) version 11 or later installed.
    *   Apache Maven installed.
    *   Git (for cloning the repository).

2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

3.  **Run the application using Maven:**
    *   Open a terminal or command prompt in the project's root directory (where `pom.xml` is located).
    *   Execute the following Maven command:
        ```bash
        mvn spring-boot:run
        ```
    *   This command will download dependencies (if not already present), compile the code, and start the embedded web server.

4.  **Access the website:**
    *   Once the application starts successfully, you will see log messages indicating that the server (usually Tomcat) has started.
    *   Open your web browser and navigate to:
        ```
        http://localhost:8080
        ```
    *   The homepage (`index.html`) should be displayed. Other pages like `properties.html`, `about.html`, etc., can be accessed via links on the site or by directly typing their paths (e.g., `http://localhost:8080/properties.html`).

---
<details>
<summary>Legacy: How to View (using Python's Simple HTTP Server - Not Recommended for current setup)</summary>

_These instructions are for running the site with a basic Python HTTP server, which was the previous method. This is no longer the primary way to run the project as it's now a Spring Boot application. Using this method will not leverage the Spring Boot backend if any dynamic features are added later._

1.  Clone this repository or download the files.
2.  Navigate to the project's root directory.
3.  Open the `index.html` file in your web browser.

    **Note on CORS:** If you encounter a Cross-Origin Resource Sharing (CORS) error when trying to load `data/properties.json` (this can happen when opening `index.html` directly in some browsers due to security restrictions), you can resolve this by serving the files using a local HTTP server.

    **How to start a local HTTP server (using Python):**
    *   Make sure you have Python installed. You can check by opening a terminal or command prompt and typing `python --version` or `python3 --version`.
    *   Navigate to the project's root directory in your terminal.
    *   Run the following command:
        *   If you have Python 3: `python3 -m http.server`
        *   If you have Python 2 (older versions): `python -m SimpleHTTPServer`
    *   The server will typically start on port 8000. You'll see a message like `Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`.
    *   Open your web browser and go to `http://localhost:8000` or `http://127.0.0.1:8000`. You should now be able to browse the website without CORS issues.
</details>

---

## Data Source

The property data is currently sourced from a static JSON file: `src/main/resources/static/data/properties.json`. This file contains placeholder data for demonstration purposes.

### Original Scraping Attempt

A Python script (`scripts/scraper.py`) was developed to scrape data from [https://properties.cityinfoservices.com/](https://properties.cityinfoservices.com/). However, due to challenges in reliably extracting all necessary fields (like property type, size, and accurate price) without direct DOM inspection capabilities, placeholder data was used for the final website build. The scraper requires `requests` and `beautifulsoup4`.

## Technologies Used

*   HTML5
*   HTML5
*   CSS3 (with Flexbox and Grid for layout)
*   JavaScript (for dynamic content loading, image gallery, and animations)
*   Spring Boot (for serving static content and future backend development)
*   Apache Maven (for project build and dependency management)
