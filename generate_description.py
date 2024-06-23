import requests
from bs4 import BeautifulSoup
import random
import json
import os
import base64
import vertexai
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models
import PIL
import base64
from PIL import Image
import io
import json
import time

vertexai.init(project="mpi2instances-350406", location="us-west4")
model = GenerativeModel(
"gemini-1.5-flash-001",
)


def get_gpt_response(link) -> str:

    #image1 = load_image_from_file("product_images/coats_0.jpg")
    image1 = Part.from_data(
        mime_type="image/jpeg",
        data=base64.b64decode(load_image_from_file_and_encode_base64(f"product_images/{link}")),
    )

    text1 = """Generate a json like

    { \"Type\": [\"t-shirts\", \"blouses\", \"shirts\", \"tank tops\", \"sweaters\", \"hoodies\", \"jackets\", \"coats\", \"jeans\", \"shorts\", \"skirts\", \"dress\", \"trousers\", \"leggings\"], \"Fabric\": [\"cotton\", \"polyester\", \"wool\", \"silk\", \"denim\", \"leather\", \"linen\", \"synthetic blends\", \"nylon\", \"rayon\", \"spandex\", \"cashmere\"], \"Color\": [\"red\", \"blue\", \"black\", \"white\", \"green\", \"yellow\", \"purple\", \"orange\", \"pink\", \"brown\", \"gray\", \"multicolor\", \"solid colors\", \"pastel\", \"neon\"], \"Size\": [\"XS\", \"S\", \"M\", \"L\", \"XL\", \"XXL\", \"XXXL\", \"one size\"], \"Pattern / Style\": [\"stripes\", \"polka dots\", \"floral\", \"geometric\", \"plaid\", \"animal print\", \"camouflage\", \"abstract\", \"paisley\", \"tie-dye\"], \"Style\": [\"casual\", \"formal\", \"athletic\", \"business\", \"vintage\", \"bohemian\", \"streetwear\", \"preppy\", \"minimalist\", \"gothic\", \"punk\", \"hipster\", \"retro\", \"chic\"], \"Season\": [\"summer\", \"winter\", \"spring\", \"autumn\", \"all-season\"], \"Function\": [\"everyday wear\", \"workwear\", \"activewear\", \"evening wear\", \"loungewear\", \"sleepwear\", \"swimwear\", \"outerwear\", \"formal wear\", \"casual wear\", \"party wear\"], \"Fit\": [\"slim fit\", \"regular fit\", \"loose fit\", \"tailored\", \"oversized\", \"athletic fit\", \"relaxed fit\"], \"Brand Type\": [\"high-end designer labels\", \"fast fashion retailers\", \"sustainable brands\", \"luxury brands\", \"boutique brands\", \"mass-market brands\", \"heritage brands\", \"eco-friendly brands\"], \"Gender\": [\"men\", \"women\", \"unisex\", \"boys\", \"girls\"] }"""
    text2 = """using the image to select one category for each field of the json, and you can only select one category per item in the json, and you must select exactly one, not more than one, of the specified options for each category in the json. Choose exactly one of the items and do not put null or any other unapproved output. 
    format of your output json is like
    {
    "Type": <string>,
    "Fabric": <string>,
    "Color": <string>,
    "Size": <string>,
    "Pattern / Style": <string>,
    "Style": <string>,
    "Season": <string>,
    "Function": <string>,
    "Fit": <string>,
    "Brand Type": <string>,
    "Gender": <string>
    }
    output only the json and nothing but the json."""

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

    gptoutput = "".join([response.text for response in list(responses)])
    return convert_bad_json_to_good_json(gptoutput)

def convert_bad_json_to_good_json(bad_json_str):
    # Load the JSON string into a Python dictionary
    data = json.loads(bad_json_str)
    
    # Initialize an empty dictionary to store the transformed data
    good_json = {}
    
    # Iterate through each key-value pair in the original data
    for key, value in data.items():
        # Ensure the value is a list
        if isinstance(value, list):
            # Take the first item if there are multiple items in the list
            if value:
                good_json[key] = value[0]
            else:
                good_json[key] = None
        else:
            # Use the string directly if it's a single string value
            good_json[key] = value
    
    # Convert the transformed dictionary back to JSON string format
    good_json_str = json.dumps(good_json)
    
    return good_json_str

def load_image_from_file_and_encode_base64(file_path: str) -> str:
    with open(file_path, 'rb') as f:
        image_bytes = f.read()
    encoded_image = base64.b64encode(image_bytes).decode('utf-8')
    return encoded_image









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

                finished = False
                while not finished:
                    try:
                        product_info = json.loads(get_gpt_response(image_filename))
                        finished = True
                    except:
                        time.sleep(20)
                
                time.sleep(1.5)
        

                product_info["Type"] = queries[int(idx / 5)]
                product_info["Image"] = image_filename
                product_info["Image_URL"] = image_url
                product_info["Price"] = price
                product_info["Listing_Link"] = link


                print(product_info)
                product_data.append(product_info)

with open("data_new.json", 'w') as f:
    json.dump(product_data, f)