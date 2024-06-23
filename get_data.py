import openai


categories = {
  "Type": [
    "tops", 
    "bottoms", 
    "dresses", 
    "outerwear", 
    "underwear", 
    "accessories", 
    "footwear"
  ],
  "Fabric": [
    "cotton", 
    "polyester", 
    "wool", 
    "silk", 
    "denim", 
    "leather", 
    "linen", 
    "synthetic blends", 
    "nylon", 
    "rayon", 
    "spandex", 
    "cashmere"
  ],
  "Color": [
    "red", 
    "blue", 
    "black", 
    "white", 
    "green", 
    "yellow", 
    "purple", 
    "orange", 
    "pink", 
    "brown", 
    "gray", 
    "multicolor", 
    "solid colors", 
    "pastel", 
    "neon"
  ],
  "Size": [
    "XS", 
    "S", 
    "M", 
    "L", 
    "XL", 
    "XXL", 
    "XXXL", 
    "one size"
  ],
  "Pattern / Style": [
    "stripes", 
    "polka dots", 
    "floral", 
    "geometric", 
    "plaid", 
    "animal print", 
    "camouflage", 
    "abstract", 
    "paisley", 
    "tie-dye"
  ],
  "Style": [
    "casual", 
    "formal", 
    "athletic", 
    "business", 
    "vintage", 
    "bohemian", 
    "streetwear", 
    "preppy", 
    "minimalist", 
    "gothic", 
    "punk", 
    "hipster", 
    "retro", 
    "chic"
  ],
  "Season": [
    "summer", 
    "winter", 
    "spring", 
    "autumn", 
    "all-season"
  ],
  "Function": [
    "everyday wear", 
    "workwear", 
    "activewear", 
    "evening wear", 
    "loungewear", 
    "sleepwear", 
    "swimwear", 
    "outerwear", 
    "formal wear", 
    "casual wear", 
    "party wear"
  ],
  "Fit": [
    "slim fit", 
    "regular fit", 
    "loose fit", 
    "tailored", 
    "oversized", 
    "athletic fit", 
    "relaxed fit"
  ],
  "Brand": [
    "high-end designer labels", 
    "fast fashion retailers", 
    "sustainable brands", 
    "luxury brands", 
    "boutique brands", 
    "mass-market brands", 
    "heritage brands", 
    "eco-friendly brands"
  ]
}