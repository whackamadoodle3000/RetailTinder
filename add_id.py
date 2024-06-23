import json

# Read the JSON data from the file
with open('data_new.json', 'r') as file:
    data = json.load(file)

# Initialize Clothes_ID starting from 1
clothes_id = 1

# Add Clothes_ID to each item in the list
for item in data:
    item['Clothes_ID'] = clothes_id
    clothes_id += 1

# Save the modified data into a new JSON file
output_file = 'clothes_data.json'
with open(output_file, 'w') as file:
    json.dump(data, file, indent=4)

print(f'New JSON file saved with Clothes_ID: {output_file}')