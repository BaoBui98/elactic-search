// Script seed dữ liệu vào PostgreSQL thật
// Chạy: npx ts-node src/database/seed.ts (hoặc dùng NestJS DataSource trực tiếp)
//
// File này chứa 60 sản phẩm mẫu để insert vào database

export const SEED_PRODUCTS = [
  // ── ELECTRONICS (20) ─────────────────────────────────────────
  { name: 'iPhone 15 Pro Max', description: 'Apple flagship smartphone with titanium frame, A17 Pro chip, and 48MP camera system. Perfect for photography enthusiasts.', price: 1199, stock: 45, category: 'electronics' },
  { name: 'iPhone 15 Standard', description: 'Apple iPhone 15 with Dynamic Island, 6.1-inch display, A16 Bionic chip. Great everyday smartphone.', price: 799, stock: 60, category: 'electronics' },
  { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung flagship with built-in S Pen, 200MP camera, Snapdragon 8 Gen 3. Ultimate Android powerhouse.', price: 1299, stock: 25, category: 'electronics' },
  { name: 'Samsung Galaxy A54', description: 'Mid-range Samsung Galaxy with 50MP camera, 5000mAh battery. Best value Android smartphone.', price: 399, stock: 90, category: 'electronics' },
  { name: 'MacBook Pro 16" M3 Max', description: 'Apple MacBook Pro with M3 Max chip, 48GB unified memory, 16-inch Liquid Retina display. Pro-level laptop for creators.', price: 3499, stock: 15, category: 'electronics' },
  { name: 'MacBook Air M2', description: 'Thin and light Apple laptop with M2 chip, fanless design, 13.6-inch display. Perfect everyday laptop.', price: 1099, stock: 40, category: 'electronics' },
  { name: 'Dell XPS 15', description: 'Premium Dell laptop with Intel Core i9, OLED display, NVIDIA RTX 4070. High-performance Windows laptop.', price: 2199, stock: 20, category: 'electronics' },
  { name: 'Sony WH-1000XM5', description: 'Industry-leading Sony noise cancelling wireless headphones, 30-hour battery, multipoint connection.', price: 349, stock: 55, category: 'electronics' },
  { name: 'AirPods Pro 2nd Gen', description: 'Apple AirPods Pro with active noise cancellation, Adaptive Audio, MagSafe USB-C charging case.', price: 249, stock: 70, category: 'electronics' },
  { name: 'Samsung Galaxy Buds 2 Pro', description: 'Samsung wireless earbuds with 360 Audio, ANC, 29-hour total battery. Best Samsung earbuds.', price: 199, stock: 65, category: 'electronics' },
  { name: 'iPad Pro 12.9" M2', description: 'Apple iPad Pro with M2 chip, Liquid Retina XDR display, Apple Pencil support. Best tablet for professionals.', price: 1099, stock: 30, category: 'electronics' },
  { name: 'Samsung Galaxy Tab S9 Ultra', description: 'Samsung flagship tablet with 14.6-inch AMOLED display, S Pen included, Snapdragon 8 Gen 2.', price: 1199, stock: 20, category: 'electronics' },
  { name: 'Sony PlayStation 5', description: 'Sony PS5 gaming console with ultra-high speed SSD, ray tracing, 4K gaming at 120fps.', price: 499, stock: 35, category: 'electronics' },
  { name: 'Xbox Series X', description: 'Microsoft Xbox Series X with 1TB SSD, 4K gaming, Xbox Game Pass compatibility.', price: 499, stock: 40, category: 'electronics' },
  { name: 'LG OLED C3 55"', description: 'LG 55-inch OLED TV with 4K resolution, 120Hz refresh rate, Dolby Vision, perfect for gaming and movies.', price: 1299, stock: 12, category: 'electronics' },
  { name: 'Samsung QLED 65" 4K', description: 'Samsung 65-inch QLED 4K TV with Quantum Dot technology, Neo QLED, Smart TV features.', price: 999, stock: 18, category: 'electronics' },
  { name: 'GoPro Hero 12 Black', description: 'GoPro action camera with 5.3K video, HyperSmooth 6.0 stabilization, waterproof to 10m.', price: 399, stock: 50, category: 'electronics' },
  { name: 'DJI Mini 4 Pro Drone', description: 'DJI foldable drone with 4K HDR video, omnidirectional obstacle sensing, 34-min flight time.', price: 759, stock: 22, category: 'electronics' },
  { name: 'Logitech MX Master 3S', description: 'Logitech premium wireless mouse with 8K DPI sensor, MagSpeed scroll, ergonomic design for productivity.', price: 99, stock: 100, category: 'electronics' },
  { name: 'Keychron K2 Pro Keyboard', description: 'Keychron compact wireless mechanical keyboard, hot-swappable, RGB backlight, works with Mac and Windows.', price: 119, stock: 80, category: 'electronics' },

  // ── FASHION (15) ─────────────────────────────────────────────
  { name: 'Nike Air Max 270', description: 'Nike running shoes with Max Air unit for all-day comfort, breathable mesh upper, street-ready style.', price: 150, stock: 120, category: 'fashion' },
  { name: 'Nike Air Force 1', description: 'Iconic Nike basketball shoe turned lifestyle classic. Leather upper, Air-Sole cushioning, timeless white design.', price: 110, stock: 150, category: 'fashion' },
  { name: 'Adidas Ultraboost 23', description: 'Adidas premium running shoe with Boost midsole, Primeknit upper, Continental rubber outsole. Best running shoes.', price: 190, stock: 85, category: 'fashion' },
  { name: 'Adidas Stan Smith', description: 'Classic Adidas tennis shoe with clean leather upper, three stripes, iconic heel tab. Timeless sneaker.', price: 80, stock: 200, category: 'fashion' },
  { name: "Levi's 501 Original Jeans", description: "Original Levi's straight-fit denim jeans, button fly, 100% cotton. The most iconic jeans in the world.", price: 69, stock: 180, category: 'fashion' },
  { name: "Levi's 511 Slim Fit Jeans", description: "Levi's slim fit jeans with stretch denim, sits below waist, slim through thigh and leg.", price: 59, stock: 160, category: 'fashion' },
  { name: 'Uniqlo Ultra Light Down Jacket', description: 'Uniqlo packable down jacket with 90% down fill, ultra lightweight, warm and water-repellent.', price: 89, stock: 110, category: 'fashion' },
  { name: 'The North Face Fleece Hoodie', description: 'The North Face cozy fleece hoodie with kangaroo pocket, relaxed fit, perfect for outdoor activities.', price: 99, stock: 95, category: 'fashion' },
  { name: 'Ray-Ban Wayfarer Sunglasses', description: 'Iconic Ray-Ban Wayfarer sunglasses with acetate frame, UV400 protection, classic American style.', price: 154, stock: 70, category: 'fashion' },
  { name: 'Fossil Minimalist Watch', description: 'Fossil slim minimalist watch with stainless steel case, leather band, Japanese quartz movement.', price: 129, stock: 60, category: 'fashion' },
  { name: 'Herschel Supply Backpack', description: 'Herschel Little America backpack with 25L capacity, laptop sleeve, signature stripe lining.', price: 99, stock: 90, category: 'fashion' },
  { name: 'Columbia Hiking Boots', description: 'Columbia waterproof hiking boots with Omni-Grip traction, Techlite midsole, ankle support.', price: 139, stock: 75, category: 'fashion' },
  { name: 'Tommy Hilfiger Polo Shirt', description: 'Classic Tommy Hilfiger polo shirt with custom-fit, moisture-wicking pique cotton, embroidered logo.', price: 59, stock: 140, category: 'fashion' },
  { name: 'Lululemon Align Leggings', description: 'Lululemon high-rise yoga leggings with Nulu fabric, buttery soft feel, 4-way stretch, 28-inch inseam.', price: 128, stock: 100, category: 'fashion' },
  { name: 'Converse Chuck Taylor All Star', description: 'Classic Converse canvas sneaker with ankle patch, All Star logo, rubber toe cap. Iconic low-top design.', price: 60, stock: 220, category: 'fashion' },

  // ── SPORTS (10) ──────────────────────────────────────────────
  { name: 'Wilson Pro Staff Tennis Racket', description: 'Wilson professional tennis racket used by Roger Federer, 97 sq inch head, 315g weight.', price: 249, stock: 40, category: 'sports' },
  { name: 'Yonex Badminton Racket', description: 'Yonex professional badminton racket with isometric head shape, graphite shaft, medium flex.', price: 89, stock: 55, category: 'sports' },
  { name: 'Spalding NBA Official Basketball', description: 'Official NBA game ball by Spalding, genuine leather, 29.5-inch circumference, Horween leather.', price: 169, stock: 65, category: 'sports' },
  { name: 'Adidas Champions League Football', description: 'Official UEFA Champions League match ball by Adidas, thermally bonded, FIFA Quality Pro certified.', price: 149, stock: 70, category: 'sports' },
  { name: 'Garmin Forerunner 965 GPS Watch', description: 'Garmin premium GPS running watch with AMOLED display, training load focus, race predictor, 31-hour battery.', price: 599, stock: 25, category: 'sports' },
  { name: 'Fitbit Charge 6', description: 'Fitbit fitness tracker with built-in GPS, heart rate monitor, 7-day battery, Google services integration.', price: 159, stock: 80, category: 'sports' },
  { name: 'TRX Suspension Training System', description: 'TRX PRO4 professional suspension trainer used by military and athletes, full-body workout anywhere.', price: 199, stock: 45, category: 'sports' },
  { name: 'Bowflex Adjustable Dumbbell Set', description: 'Bowflex SelectTech 552 adjustable dumbbells, replace 15 sets of weights, 5 to 52.5 lbs per dumbbell.', price: 399, stock: 30, category: 'sports' },
  { name: 'Peloton Bike+ Smart Exercise Bike', description: 'Peloton connected indoor cycling bike with 24-inch rotating touchscreen, auto-resistance, live classes.', price: 2495, stock: 10, category: 'sports' },
  { name: 'Hydro Flask 32oz Water Bottle', description: 'Hydro Flask stainless steel insulated water bottle, TempShield keeps drinks cold 24h or hot 12h.', price: 44, stock: 200, category: 'sports' },

  // ── HOME (10) ─────────────────────────────────────────────────
  { name: 'Dyson V15 Detect Vacuum', description: 'Dyson cordless vacuum with laser dust detection, 60-min runtime, HEPA filtration, powerful suction.', price: 749, stock: 20, category: 'home' },
  { name: 'Roomba i7+ Robot Vacuum', description: 'iRobot Roomba i7+ with auto-emptying base, smart mapping, works with Alexa and Google Assistant.', price: 599, stock: 25, category: 'home' },
  { name: 'Nespresso Vertuo Next Coffee Machine', description: 'Nespresso Vertuo Next coffee maker with Centrifusion technology, brews 5 cup sizes, WiFi connected.', price: 179, stock: 50, category: 'home' },
  { name: 'KitchenAid Stand Mixer', description: 'KitchenAid 5-quart tilt-head stand mixer, 10 speeds, 59 attachments available, iconic home appliance.', price: 449, stock: 35, category: 'home' },
  { name: 'Instant Pot Duo 7-in-1', description: 'Instant Pot 6-quart electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker.', price: 99, stock: 90, category: 'home' },
  { name: 'Ninja Air Fryer XL', description: 'Ninja 5.5-quart air fryer with Max Crisp Technology, 450°F, dehydrate function, dishwasher safe.', price: 119, stock: 75, category: 'home' },
  { name: 'Philips Hue Smart Bulb Starter Kit', description: 'Philips Hue white and color ambiance smart bulbs, 16 million colors, Alexa and Google Home compatible.', price: 199, stock: 60, category: 'home' },
  { name: 'Nest Learning Thermostat', description: 'Google Nest smart thermostat that programs itself, learns your schedule, saves energy, remote control via app.', price: 249, stock: 45, category: 'home' },
  { name: 'Le Creuset Dutch Oven 5.5qt', description: 'Le Creuset enameled cast iron dutch oven, even heat distribution, works on all cooktops including induction.', price: 419, stock: 28, category: 'home' },
  { name: 'Vitamix 5200 Blender', description: 'Vitamix professional-grade blender with aircraft-grade stainless steel blades, variable speed control, 64oz container.', price: 549, stock: 32, category: 'home' },

  // ── BOOKS (5) ─────────────────────────────────────────────────
  { name: 'Clean Code', description: 'A handbook of agile software craftsmanship by Robert C. Martin. Learn to write clean, readable code and best practices for software developers.', price: 39, stock: 300, category: 'books' },
  { name: 'Designing Data-Intensive Applications', description: 'Martin Kleppmann book on building scalable, reliable, and maintainable data systems. Essential for backend engineers.', price: 59, stock: 250, category: 'books' },
  { name: 'The Pragmatic Programmer', description: 'A timeless classic by David Thomas and Andrew Hunt. Tips and tricks for becoming a better software developer.', price: 44, stock: 220, category: 'books' },
  { name: 'System Design Interview Vol.2', description: 'Alex Xu book on system design interview preparation. Covers distributed systems, scalability, and real-world architecture.', price: 49, stock: 180, category: 'books' },
  { name: "You Don't Know JS: Async & Performance", description: 'Kyle Simpson deep-dive into JavaScript async patterns, Promises, generators, and performance optimization.', price: 34, stock: 200, category: 'books' },
];

