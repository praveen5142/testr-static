import requests
from bs4 import BeautifulSoup
import json
import os
import re

# Define the base URL and target cities
BASE_URL = "https://properties.cityinfoservices.com/"
CITIES_CONFIG = {
    "Delhi": "properties-for-rent-in-delhi/srp",
    "Gurgaon": "properties-for-rent-in-gurgaon/srp",
    "Noida": "properties-for-rent-in-noida/srp",
}

# Create data directory if it doesn't exist
if not os.path.exists("data"):
    os.makedirs("data")

def get_property_item_text_and_images(link_element):
    """
    Attempts to find a reasonable parent 'card' for the link, get its text, and extract image URLs.
    The goal is to find the smallest common parent that contains all info for THAT listing.
    """
    item_container = None

    # Try to find common list item tags or specific divs that might wrap a whole property item
    # This order can be adjusted based on observed HTML structure (if known)
    possible_item_parents = ['li', 'article']
    for tag_name in possible_item_parents:
        ancestor = link_element.find_parents(tag_name, limit=1)
        if ancestor:
            item_container = ancestor[0]
            break

    if not item_container:
        # Fallback: Look for a div that seems to be a direct child of a list-like container,
        # or a div that has other divs as siblings (a common card pattern).
        # This is highly heuristic without knowing specific classes.
        # Defaulting to grandparent, as it provided better location/developer previously.
        if link_element.parent is not None and link_element.parent.parent is not None:
            item_container = link_element.parent.parent
        elif link_element.parent is not None:
            item_container = link_element.parent
        else:
            item_container = link_element # Should not happen often

    card_text = ""
    image_urls = []

    if item_container:
        card_text = item_container.get_text(separator=" ", strip=True)

        # Extract images from this container
        for img_tag in item_container.find_all('img'):
            src = img_tag.get('src')
            if src:
                # Ensure URL is absolute
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = BASE_URL.rstrip('/') + src
                elif not src.startswith('http'):
                    # Assuming it's a relative path from the base URL or a common image path
                    # This might need adjustment if images are stored elsewhere
                    src = BASE_URL.rstrip('/') + '/' + src.lstrip('/')
                image_urls.append(src)

    return card_text, image_urls


def scrape_properties():
    all_properties = []
    for city_name, city_path in CITIES_CONFIG.items():
        city_url = f"{BASE_URL}{city_path}"
        print(f"Scraping properties in {city_name} from {city_url}")
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(city_url, headers=headers, timeout=20)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page for {city_name}: {e}")
            continue

        soup = BeautifulSoup(response.content, "html.parser")
        detail_links_all = soup.find_all("a", href=re.compile(r'/pjd$'))

        property_detail_links = []
        ignore_texts = ["view options", "contact", "view details", "get details"]
        for link in detail_links_all:
            if link is None: continue
            link_text = link.text.strip()
            link_text_lower = link_text.lower()
            if link_text_lower and not any(ignore_text in link_text_lower for ignore_text in ignore_texts) and len(link_text) > 5:
                property_detail_links.append(link)

        print(f"Found {len(property_detail_links)} potential property detail links for {city_name} after filtering.")
        processed_urls = set()

        for link in property_detail_links:
            details_url = BASE_URL.rstrip('/') + link.get('href', 'N/A')
            if details_url in processed_urls or details_url == "N/A": continue

            card_text, image_urls = get_property_item_text_and_images(link)
            if not card_text:
                 print(f"Could not get any text context for link: {link.text.strip()}")
                 continue

            property_data = {"city": city_name}
            title = link.text.strip()
            # Clean title if it contains other field hints (less likely if card_text is scoped well)
            title = re.sub(r"\s*Location\s*:.*", "", title, flags=re.IGNORECASE).strip()
            title = re.sub(r"\s*Developer\s*:.*", "", title, flags=re.IGNORECASE).strip()
            property_data["title"] = title
            property_data["details_url"] = details_url
            property_data["images"] = image_urls # Add images

            # Location and Developer (these were working well with grandparent scope)
            location_match = re.search(r"Location\s*:\s*([^<]+?)(?=\s*Developer:|\s*\* Type:|\s*Type:|\s*Available Units|\s*Price on Request|\s*Leased Out|$)", card_text, re.IGNORECASE)
            property_data["location"] = location_match.group(1).strip() if location_match else "N/A"

            developer_match = re.search(r"Developer\s*:\s*([^<]+?)(?=\s*\* Type:|\s*Type:|\s*Available Units|\s*Price on Request|\s*Leased Out|$)", card_text, re.IGNORECASE)
            property_data["developer"] = developer_match.group(1).strip() if developer_match else "N/A"

            # --- Refined Extraction for Type, Size, Price ---

            # Type: Look for "* Type: value" or "Type: value"
            # Common types: Office Space, Industrial, Warehouse, Business Center & Co-working Space, Managed Office etc.
            type_pattern = r"(?:\*?\s*Type\s*:\s*)([\w\s&\-\/,]+?)(?=\s*(?:Developer:|Location:|Available Units|Price on Request|Leased Out|Sq\. ft\.|$))"
            type_match = re.search(type_pattern, card_text, re.IGNORECASE)
            property_data["type"] = type_match.group(1).strip() if type_match else "N/A"

            # Size: Look for "value Sq. ft."
            size_match = re.search(r"([\d,.\s-]+)\s*Sq\.\s*ft", card_text, re.IGNORECASE)
            property_data["size"] = size_match.group(1).strip().rstrip('.').strip() + " Sq. ft." if size_match else "N/A"

            # Price:
            price = "N/A"
            if re.search(r"Price on Request", card_text, re.IGNORECASE):
                price = "Price on Request"
            else:
                # Try to find numerical prices (e.g., "Rs. 50 Lacs", "50,000", "5 Crores", "5000 - 8000")
                # Avoid matching the size value if it's also numeric.
                # This regex is broad and might need context checks.
                price_val_match = re.search(
                    r"(?:Rs\.?\s*)?([\d,.-]+(?:\s*-\s*[\d,.-]+)?(?:\s*(?:Lacs?|Crores?))?)(?!\s*Sq\.\s*ft)",
                    card_text,
                    re.IGNORECASE
                )
                if price_val_match:
                    potential_price = price_val_match.group(1).strip()
                    is_size_value = False
                    if property_data["size"] != "N/A":
                        size_numeric_part = property_data["size"].replace(" Sq. ft.", "").strip()
                        # Normalize potential price by removing common currency symbols or units for comparison
                        normalized_potential_price = potential_price.replace("Rs.","").replace("Lacs","").replace("Crores","").strip()
                        if normalized_potential_price == size_numeric_part.replace(",",""):
                            is_size_value = True

                    if not is_size_value:
                        # Further filter out simple numbers that are unlikely to be prices (e.g. sector numbers, unit counts)
                        # Allow if it contains typical price units or is a larger number/range.
                        if (re.search(r"(Lacs?|Crores?|-)", potential_price, re.IGNORECASE) or \
                            (potential_price.replace(",","").replace(".","").isdigit() and len(potential_price.replace(",","")) >= 4) ):
                            price = potential_price
                        elif not potential_price.replace(",","").replace(".","").isdigit(): # allow non-purely-numeric if not caught by above
                            price = potential_price


            property_data["price"] = price
            # Final cleanup for price artifacts
            if property_data["price"] in ["-", ".", ","] or (property_data["price"] and property_data["price"].replace(",","").replace(".","").isdigit() and len(property_data["price"])<3):
                 if not (property_data["price"].isdigit() and int(property_data["price"]) > 0) : # allow small numbers if they are actual prices
                    property_data["price"] = "N/A"


            all_properties.append(property_data)
            processed_urls.add(details_url)

        print(f"Successfully processed {len(processed_urls)} unique properties for {city_name}.")

    output_path = "data/properties.json"
    try:
        with open(output_path, "w") as f:
            json.dump(all_properties, f, indent=4)
        print(f"Scraped data saved to {output_path}")
        if not all_properties: print("Warning: No properties were scraped.")
    except IOError as e:
        print(f"Error writing to {output_path}: {e}")

if __name__ == "__main__":
    scrape_properties()
