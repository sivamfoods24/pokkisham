/**
 * Pokkisham Store Data Database
 * Products, Categories, Testimonials, Store Information & Coupons
 */

const POKKISHAM_DATA = {
  storeInfo: {
    name: "Pokkisham Cold Pressed Oil Mill & Grocery Store",
    slogan: "Pure Oils. Healthy Life.",
    heroTitle: "Pure by Nature. Good for Life.",
    heroSub: "Cold Pressed Oils, Millets, Nuts & Natural Groceries for a Healthy Lifestyle.",
    phone: "+91 90474 77499",
    whatsapp: "https://wa.me/919047477499",
    email: "pokkishamstore@gmail.com",
    address: "Trichy, Tamil Nadu, India",
    workingHours: "Mon - Sat: 8:00 AM - 9:00 PM",
    deliveryInfo: "Fast Delivery Across Tamil Nadu & All Over India",
    freeShippingThreshold: 999,
    paymentSettings: {
      upiId: "9047477499@ybl",
      upiName: "Pokkisham Store",
      qrCodeImage: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=9047477499@ybl&pn=Pokkisham%20Store",
      bankName: "State Bank of India",
      accNo: "39485720194",
      ifsc: "SBIN0004819"
    }
  },

  categories: [
    {
      id: "oils",
      name: "Cold Pressed Oils",
      badge: "10+ Oils",
      icon: "🛢️",
      image: "assets/images/gingelly_oil.jpg",
      description: "Traditional wooden cold pressed pure unrefined oils."
    },
    {
      id: "millets",
      name: "Millets",
      badge: "6+ Millets",
      icon: "🌾",
      image: "assets/images/karuppu_kavuni.jpg",
      description: "Organic & unpolished nutrient-rich native millets."
    },
    {
      id: "rice",
      name: "Rice Varieties",
      badge: "6+ Products",
      icon: "🍚",
      image: "assets/images/karuppu_kavuni.jpg",
      description: "Traditional heritage South Indian rice varieties."
    },
    {
      id: "nuts",
      name: "Nuts & Dry Fruits",
      badge: "10+ Items",
      icon: "🌰",
      image: "assets/images/badam_nuts.jpg",
      description: "Crunchy premium healthy dry fruits & nuts."
    },
    {
      id: "spices",
      name: "Podi & Spices",
      badge: "12+ Products",
      icon: "🌶️",
      image: "assets/images/himalayan_salt.jpg",
      description: "Authentic homemade podis & pure ground spices."
    },
    {
      id: "grocery",
      name: "Grocery Items",
      badge: "15+ Items",
      icon: "🛍️",
      image: "assets/images/hero_banner.jpg",
      description: "100% natural organic daily kitchen essentials."
    }
  ],

  products: [
    {
      id: "prod-1",
      name: "Wooden Cold Pressed Gingelly Oil",
      category: "oils",
      badge: "Best Seller",
      rating: 5,
      reviewsCount: 128,
      price: 350.00,
      oldPrice: 390.00,
      unit: "1 Litre",
      variants: ["500 ml", "1 Litre", "2 Litres", "5 Litres"],
      variantPrices: { "500 ml": 180, "1 Litre": 350, "2 Litres": 680, "5 Litres": 1650 },
      image: "assets/images/gingelly_oil.jpg",
      description: "Extracted using traditional wooden chekku mill from selected premium black sesame seeds. 100% natural, chemical-free, and unrefined. Preserves natural aroma and heart-healthy antioxidants.",
      inStock: true
    },
    {
      id: "prod-2",
      name: "Wooden Cold Pressed Groundnut Oil",
      category: "oils",
      badge: "Pure Natural",
      rating: 5,
      reviewsCount: 94,
      price: 320.00,
      oldPrice: 360.00,
      unit: "1 Litre",
      variants: ["500 ml", "1 Litre", "2 Litres", "5 Litres"],
      variantPrices: { "500 ml": 165, "1 Litre": 320, "2 Litres": 630, "5 Litres": 1500 },
      image: "assets/images/groundnut_oil.jpg",
      description: "Pure wooden cold pressed groundnut oil made from handpicked sun-dried peanuts. Ideal for deep frying, daily cooking, and retains original nutty flavor without cholesterol.",
      inStock: true
    },
    {
      id: "prod-3",
      name: "Premium Quality Karuppu Kavuni Rice",
      category: "rice",
      badge: "Heritage Rice",
      rating: 5,
      reviewsCount: 76,
      price: 120.00,
      oldPrice: 150.00,
      unit: "1 Kg",
      variants: ["500g", "1 Kg", "5 Kg"],
      variantPrices: { "500g": 65, "1 Kg": 120, "5 Kg": 560 },
      image: "assets/images/karuppu_kavuni.jpg",
      description: "Ancient South Indian black rice rich in Anthocyanin antioxidants, iron, and fiber. Superfood for immune boost, diabetes control, and metabolic wellness.",
      inStock: true
    },
    {
      id: "prod-4",
      name: "Natural & Healthy Badam Nuts",
      category: "nuts",
      badge: "Premium Grade",
      rating: 5,
      reviewsCount: 62,
      price: 650.00,
      oldPrice: 720.00,
      unit: "250g",
      variants: ["250g", "500g", "1 Kg"],
      variantPrices: { "250g": 650, "500g": 1250, "1 Kg": 2400 },
      image: "assets/images/badam_nuts.jpg",
      description: "Raw Californian premium almonds packed with vitamin E, protein, healthy fats, and magnesium. Great snack for memory power and daily energy.",
      inStock: true
    },
    {
      id: "prod-5",
      name: "Traditional Taste Himalayan Rock Salt",
      category: "spices",
      badge: "100% Pure",
      rating: 5,
      reviewsCount: 110,
      price: 100.00,
      oldPrice: 125.00,
      unit: "500g",
      variants: ["500g", "1 Kg"],
      variantPrices: { "500g": 100, "1 Kg": 180 },
      image: "assets/images/himalayan_salt.jpg",
      description: "Pure unrefined pink Himalayan rock salt rich in 84 natural trace minerals. Replaces regular table salt for better digestion and blood pressure balance.",
      inStock: true
    },
    {
      id: "prod-6",
      name: "Pure Wooden Cold Pressed Coconut Oil",
      category: "oils",
      badge: "Best Seller",
      rating: 5,
      reviewsCount: 145,
      price: 280.00,
      oldPrice: 310.00,
      unit: "1 Litre",
      variants: ["500 ml", "1 Litre", "2 Litres", "5 Litres"],
      variantPrices: { "500 ml": 145, "1 Litre": 280, "2 Litres": 540, "5 Litres": 1300 },
      image: "assets/images/coconut_oil.jpg",
      description: "100% virgin cold pressed coconut oil crushed from naturally sun-dried copra. Excellent for cooking, oil pulling, hair care, and skin hydration.",
      inStock: true
    },
    {
      id: "prod-7",
      name: "Organic Thinai (Foxtail Millet)",
      category: "millets",
      badge: "Unpolished",
      rating: 5,
      reviewsCount: 48,
      price: 90.00,
      oldPrice: 110.00,
      unit: "1 Kg",
      variants: ["500g", "1 Kg", "5 Kg"],
      variantPrices: { "500g": 50, "1 Kg": 90, "5 Kg": 420 },
      image: "assets/images/karuppu_kavuni.jpg",
      description: "Native unpolished foxtail millet rich in dietary fiber, calcium, and complex carbs. Great substitute for white rice for diabetic management.",
      inStock: true
    },
    {
      id: "prod-8",
      name: "Traditional Idli Podi (Homemade)",
      category: "spices",
      badge: "Authentic Taste",
      rating: 5,
      reviewsCount: 88,
      price: 75.00,
      oldPrice: 90.00,
      unit: "250g",
      variants: ["250g", "500g", "1 Kg"],
      variantPrices: { "250g": 75, "500g": 140, "1 Kg": 270 },
      image: "assets/images/himalayan_salt.jpg",
      description: "Traditional South Indian gun powder blend roasted with sesame seeds, urad dal, red chillies, and asafoetida. Perfect with gingelly oil and idlis.",
      inStock: true
    }
  ],

  testimonials: [
    {
      id: 1,
      name: "Priya S.",
      location: "Chennai",
      rating: 5,
      comment: "Excellent quality oils and groceries. You can really taste the difference. 100% Natural! Delivery was prompt and packaging was solid."
    },
    {
      id: 2,
      name: "Ravi K.",
      location: "Trichy",
      rating: 5,
      comment: "Very pure and fresh products. Packaging is also very good. Highly recommended! We have switched to Pokkisham gingelly oil for our daily cooking."
    },
    {
      id: 3,
      name: "Meena L.",
      location: "Madurai",
      rating: 5,
      comment: "Love the traditional taste and natural aroma of their oils. Best in quality! Karuppu Kavuni rice is also top notch quality."
    },
    {
      id: 4,
      name: "Karthik Raja",
      location: "Coimbatore",
      rating: 5,
      comment: "The coconut oil scent brings back nostalgic memories of traditional chekku oil mills. 100% authentic and unadulterated."
    }
  ],

  stats: [
    { label: "Happy Customers", value: 5000, suffix: "+" },
    { label: "Quality Products", value: 100, suffix: "+" },
    { label: "Years of Trust", value: 10, suffix: "+" },
    { label: "Natural Products", value: 100, suffix: "%" }
  ],

  coupons: {
    "POKKISHAM10": { discountPercent: 10, description: "10% OFF on all items" },
    "PURE25": { discountPercent: 25, minSpend: 1500, description: "25% OFF on orders over ₹1500" },
    "FIRSTFREE": { fixedDiscount: 100, minSpend: 500, description: "Flat ₹100 OFF on order above ₹500" }
  }
};
