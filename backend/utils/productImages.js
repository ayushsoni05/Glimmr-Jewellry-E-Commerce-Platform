// Product image mapping based on category and material
// This ensures that products display images matching their material type

const categoryMaterialImageMap = {
  rings: {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632639/pexels-photo-5632639.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622624/pexels-photo-3622624.jpeg'
    ]
  },
  necklaces: {
    gold: [
      'https://images.pexels.com/photos/3622618/pexels-photo-3622618.jpeg',
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622618/pexels-photo-3622618.jpeg',
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg'
    ]
  },
  pendants: {
    gold: [
      'https://images.pexels.com/photos/3622620/pexels-photo-3622620.jpeg',
      'https://images.pexels.com/photos/4624698/pexels-photo-4624698.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632639/pexels-photo-5632639.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622620/pexels-photo-3622620.jpeg',
      'https://images.pexels.com/photos/4624698/pexels-photo-4624698.jpeg'
    ]
  },
  bangles: {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ]
  },
  bracelets: {
    gold: [
      'https://images.pexels.com/photos/3622627/pexels-photo-3622627.jpeg',
      'https://images.pexels.com/photos/4624699/pexels-photo-4624699.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632641/pexels-photo-5632641.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622627/pexels-photo-3622627.jpeg',
      'https://images.pexels.com/photos/4624699/pexels-photo-4624699.jpeg'
    ]
  },
  earrings: {
    gold: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622626/pexels-photo-3622626.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622626/pexels-photo-3622626.jpeg'
    ]
  },
  wedding: {
    gold: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ]
  },
  chains: {
    gold: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632642/pexels-photo-5632642.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ]
  },
  'nose-pins': {
    gold: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622621/pexels-photo-3622621.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ]
  },
  'toe-rings': {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622629/pexels-photo-3622629.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622629/pexels-photo-3622629.jpeg'
    ]
  },
  anklets: {
    gold: [
      'https://images.pexels.com/photos/3622630/pexels-photo-3622630.jpeg',
      'https://images.pexels.com/photos/4624702/pexels-photo-4624702.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/8537908/pexels-photo-8537908.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622630/pexels-photo-3622630.jpeg',
      'https://images.pexels.com/photos/4624702/pexels-photo-4624702.jpeg'
    ]
  },
  kadas: {
    gold: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622628/pexels-photo-3622628.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg',
      'https://images.pexels.com/photos/3622619/pexels-photo-3622619.jpeg'
    ]
  },
  mangalsutra: {
    gold: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632643/pexels-photo-5632643.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/4624697/pexels-photo-4624697.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ]
  },
  sets: {
    gold: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ],
    silver: [
      'https://images.pexels.com/photos/5632640/pexels-photo-5632640.jpeg',
      'https://images.pexels.com/photos/3622625/pexels-photo-3622625.jpeg'
    ],
    diamond: [
      'https://images.pexels.com/photos/3622596/pexels-photo-3622596.jpeg',
      'https://images.pexels.com/photos/2552014/pexels-photo-2552014.jpeg'
    ]
  }
};

/**
 * Get the appropriate product image based on category and material
 * @param {string} category - Product category
 * @param {string} material - Product material
 * @returns {string} - Image URL matching the product's category and material
 */
function getImageForCategoryAndMaterial(category, material) {
  const categoryKey = (category || 'rings').toLowerCase().trim();
  const materialKey = (material || 'gold').toLowerCase().trim();
  
  // Get category images (fallback to rings if category not found)
  const categoryImages = categoryMaterialImageMap[categoryKey] || categoryMaterialImageMap['rings'];
  
  // Get material images (fallback to gold if material not found)
  const materialImages = categoryImages[materialKey] || categoryImages['gold'];
  
  // Return first image from the array
  return materialImages[0];
}

/**
 * Get a random image from the available images for a category and material
 * @param {string} category - Product category
 * @param {string} material - Product material
 * @returns {string} - Random image URL matching the product's category and material
 */
function getRandomImageForCategoryAndMaterial(category, material) {
  const categoryKey = (category || 'rings').toLowerCase().trim();
  const materialKey = (material || 'gold').toLowerCase().trim();
  
  const categoryImages = categoryMaterialImageMap[categoryKey] || categoryMaterialImageMap['rings'];
  const materialImages = categoryImages[materialKey] || categoryImages['gold'];
  
  // Return random image from the array
  return materialImages[Math.floor(Math.random() * materialImages.length)];
}

module.exports = {
  getImageForCategoryAndMaterial,
  getRandomImageForCategoryAndMaterial,
  categoryMaterialImageMap
};
