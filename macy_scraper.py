import requests
from bs4 import BeautifulSoup
import random
import json
import os
import base64
import vertexai
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models

import base64

# Function to encode image file to Base64 string
def image_to_base64(file_path):
    with open(file_path, "rb") as image_file:
        # Read the image file
        encoded_string = base64.b64encode(image_file.read())
        # Decode to printable string in UTF-8
        base64_string = encoded_string.decode('utf-8')
        return base64_string


queries = ["t-shirts", "blouses", "shirts", "tank tops", "sweaters", "hoodies", "jackets", "coats", "jeans", "shorts", "skirts", "dress", "trousers", "leggings"]  # Add more queries as needed

all_links = []

for query in queries:
    url = f"https://www.macys.com/shop/search?keyword={query}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.content, 'html.parser')

    # Find all links to product listings
    product_links = []
    for a in soup.find_all('a', href=True):
        if '/shop/product/' in a['href']:
            product_links.append("https://www.macys.com" + a['href'])

    # Select 5 random links
    random.shuffle(product_links)
    selected_links = product_links[:5]  # Select the first 5 elements

    all_links.extend(selected_links)

# Directory to store downloaded images
image_dir = 'product_images'
if not os.path.exists(image_dir):
    os.makedirs(image_dir)

# Now, we'll download images and gather product data
product_data = []

for idx, link in enumerate(all_links):
    response = requests.get(link, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the main product image
    main_image = soup.find('img', class_='main-image-img')
    if main_image:
        image_url = main_image['src']
        
        # Download the image
        image_response = requests.get(image_url)
        
        # Save the image with a unique filename
        image_filename = f"{queries[int(idx / 5)]}_{idx % 5}.jpg"
        image_path = os.path.join(image_dir, image_filename)
        
        with open(image_path, 'wb') as f:
            f.write(image_response.content)
        
        # Find the price information
        price_container = soup.find('div', {'data-el': 'price'})
        if price_container:
            price_elements = price_container.find_all('div', class_='tiered-prices large redesign-temp')
            if price_elements:
                sale_price_element = price_elements[0].find('div', class_='lowest-sale-price')
                regular_price_element = price_elements[0].find('div', class_='c-strike')
                
                sale_price = float(sale_price_element.text.strip().replace('$', '')) if sale_price_element else 999999999999
                regular_price = float(regular_price_element.text.strip().replace('$', '')) if regular_price_element else 999999999999
                price = min([sale_price, regular_price])
                print(image_filename, price)
                # Mock JSON data for the product
                product_info = {
                    "Type": queries[int(idx / 5)],
                    "Image": image_url,
                    "Price": price,
                    "Fabric": ["cotton", "polyester", "wool", "silk", "denim", "leather", "linen", "synthetic blends", "nylon", "rayon", "spandex", "cashmere"],
                    "Color": ["red", "blue", "black", "white", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "multicolor", "solid colors", "pastel", "neon"],
                    "Size": ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "one size"],
                    "Pattern / Style": ["stripes", "polka dots", "floral", "geometric", "plaid", "animal print", "camouflage", "abstract", "paisley", "tie-dye"],
                    "Style": ["casual", "formal", "athletic", "business", "vintage", "bohemian", "streetwear", "preppy", "minimalist", "gothic", "punk", "hipster", "retro", "chic"],
                    "Season": ["summer", "winter", "spring", "autumn", "all-season"],
                    "Function": ["everyday wear", "workwear", "activewear", "evening wear", "loungewear", "sleepwear", "swimwear", "outerwear", "formal wear", "casual wear", "party wear"],
                    "Fit": ["slim fit", "regular fit", "loose fit", "tailored", "oversized", "athletic fit", "relaxed fit"],
                    "Brand Type": ["high-end designer labels", "fast fashion retailers", "sustainable brands", "luxury brands", "boutique brands", "mass-market brands", "heritage brands", "eco-friendly brands"],
                    "Gender": ["men", "women", "unisex", "boys", "girls"]
                }
                
                product_data.append(product_info)

# Output the collected product data (JSON-like)
#print(json.dumps(product_data, indent=2))


vertexai.init(project="mpi2instances-350406", location="us-west4")
model = GenerativeModel(
"gemini-1.5-flash-001",
)

image1 = base64.b64encode(image_to_base64("product_images/blouses_0.jpg")).decode('utf-8')
text1 = """Generate a json like

{ \"Type\": [\"t-shirts\", \"blouses\", \"shirts\", \"tank tops\", \"sweaters\", \"hoodies\", \"jackets\", \"coats\", \"jeans\", \"shorts\", \"skirts\", \"dress\", \"trousers\", \"leggings\"], \"Fabric\": [\"cotton\", \"polyester\", \"wool\", \"silk\", \"denim\", \"leather\", \"linen\", \"synthetic blends\", \"nylon\", \"rayon\", \"spandex\", \"cashmere\"], \"Color\": [\"red\", \"blue\", \"black\", \"white\", \"green\", \"yellow\", \"purple\", \"orange\", \"pink\", \"brown\", \"gray\", \"multicolor\", \"solid colors\", \"pastel\", \"neon\"], \"Size\": [\"XS\", \"S\", \"M\", \"L\", \"XL\", \"XXL\", \"XXXL\", \"one size\"], \"Pattern / Style\": [\"stripes\", \"polka dots\", \"floral\", \"geometric\", \"plaid\", \"animal print\", \"camouflage\", \"abstract\", \"paisley\", \"tie-dye\"], \"Style\": [\"casual\", \"formal\", \"athletic\", \"business\", \"vintage\", \"bohemian\", \"streetwear\", \"preppy\", \"minimalist\", \"gothic\", \"punk\", \"hipster\", \"retro\", \"chic\"], \"Season\": [\"summer\", \"winter\", \"spring\", \"autumn\", \"all-season\"], \"Function\": [\"everyday wear\", \"workwear\", \"activewear\", \"evening wear\", \"loungewear\", \"sleepwear\", \"swimwear\", \"outerwear\", \"formal wear\", \"casual wear\", \"party wear\"], \"Fit\": [\"slim fit\", \"regular fit\", \"loose fit\", \"tailored\", \"oversized\", \"athletic fit\", \"relaxed fit\"], \"Brand Type\": [\"high-end designer labels\", \"fast fashion retailers\", \"sustainable brands\", \"luxury brands\", \"boutique brands\", \"mass-market brands\", \"heritage brands\", \"eco-friendly brands\"], \"Gender\": [\"men\", \"women\", \"unisex\", \"boys\", \"girls\"] }"""
text2 = """using the image to select a category for each field of the json, and you can only select one category per item in the json, and you must select exactly one, not more than one, of the specified options for each category in the json"""

generation_config = {
    "max_output_tokens": 8192,
    "temperature": 1,
    "top_p": 0.95,
}

safety_settings = {
    generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}


responses = model.generate_content(
    [image1, text1, text2],
    generation_config=generation_config,
    safety_settings=safety_settings,
    stream=True,
)

for response in responses:
    print(response.text, end="")