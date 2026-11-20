import type { Category, Coupon, FAQ, Product, SiteSettings } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { id: "cat-smart-watches", name: "Smart Watches", slug: "smart-watches", description: "Smartwatches, fitness bands & wearables", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", sort_order: 1 },
  { id: "cat-power-banks", name: "Power Banks", slug: "power-banks", description: "Fast-charging power banks & batteries", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80", sort_order: 2 },
  { id: "cat-airpods", name: "AirPods", slug: "airpods", description: "AirPods, Pro, Max & more", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80", sort_order: 3 },
  { id: "cat-chargers", name: "Chargers & Cables", slug: "chargers", description: "USB-C cables, wireless & MagSafe chargers", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80", sort_order: 4 },
];

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const PRODUCTS: Product[] = [
  {
    id: "p1", slug: "airpods-pro-2-usb-c", name: "AirPods Pro (2nd Gen) USB-C", brand: "Apple",
    description: "Active Noise Cancellation, Adaptive Audio, and USB-C charging case. Up to 30 hours of total battery life with the case.",
    price: 58999, compare_at_price: 64999, category_id: "cat-airpods", category_slug: "airpods",
    stock: 14, is_featured: true, is_bestseller: true, is_new: true, colors: ["White"],
    images: [img("1606220945770-b5b6c2c55bf1"), img("1590658268037-6bf12165a8df"), img("1603351154351-5cfb3d04ef30")],
    specifications: { "Chip": "H2", "Battery": "Up to 30 hrs (with case)", "Charging": "USB-C / MagSafe", "Water Resistance": "IP54" },
    verification_enabled: true,
  },
  {
    id: "p2", slug: "airpods-4-anc", name: "AirPods 4 with Active Noise Cancellation", brand: "Apple",
    description: "Open-ear design with Active Noise Cancellation, Personalized Spatial Audio, and H2 chip performance.",
    price: 44999, compare_at_price: 49999, category_id: "cat-airpods", category_slug: "airpods",
    stock: 22, is_featured: true, is_bestseller: true, colors: ["White"],
    images: [img("1606220945770-b5b6c2c55bf1", 800), img("1572569511254-d8f925fe2cbb")],
    specifications: { "Chip": "H2", "Battery": "Up to 24 hrs (with case)", "Charging": "USB-C", "ANC": "Yes" },
    verification_enabled: true,
  },
  {
    id: "p3", slug: "airpods-max", name: "AirPods Max", brand: "Apple",
    description: "Over-ear headphones with high-fidelity audio, Active Noise Cancellation, and 20 hours of battery life.",
    price: 145000, category_id: "cat-airpods", category_slug: "airpods",
    stock: 6, is_featured: true, colors: ["Space Gray", "Silver", "Sky Blue", "Midnight"],
    images: [img("1583394838336-acd977736f90"), img("1505740420928-5e560c06d30e")],
    specifications: { "Driver": "40mm dynamic", "Battery": "Up to 20 hrs", "Chip": "H1 ×2", "Connection": "Bluetooth 5.0" },
    verification_enabled: true,
  },
  {
    id: "p4", slug: "airpods-silicone-case-magsafe", name: "AirPods Pro Silicone Case with MagSafe", brand: "Tekfinity",
    description: "Soft-touch silicone case with MagSafe magnet alignment, precise cutouts and wireless charging compatible.",
    price: 2499, compare_at_price: 3499, category_id: "cat-cases", category_slug: "cases",
    stock: 85, is_bestseller: true, colors: ["Black", "White", "Teal", "Navy"],
    images: [img("1523275335684-37898b6baf30"), img("1615663245857-ac93bb7c39e7")],
    specifications: { "Material": "Liquid silicone", "MagSafe": "Yes", "Wireless Charging": "Compatible" },
  },
  {
    id: "p5", slug: "airpods-leather-case", name: "AirPods Pro Premium Leather Case", brand: "Tekfinity",
    description: "Genuine leather case with microfiber lining, magnetic lid closure and metal logo accent.",
    price: 5999, compare_at_price: 7999, category_id: "cat-cases", category_slug: "cases",
    stock: 30, colors: ["Brown", "Black"],
    images: [img("1615663245857-ac93bb7c39e7"), img("1523275335684-37898b6baf30")],
    specifications: { "Material": "PU leather", "Lining": "Microfiber", "Closure": "Magnetic" },
  },
  {
    id: "p6", slug: "usb-c-to-lightning-cable-2m", name: "USB-C to Lightning Cable (2m, MFi)", brand: "Tekfinity",
    description: "Braided nylon cable, MFi certified, supports fast charging up to 20W for iPhone and AirPods.",
    price: 1499, compare_at_price: 2499, category_id: "cat-chargers", category_slug: "chargers",
    stock: 140, is_bestseller: true, is_flash_sale: true, colors: ["White", "Black"],
    images: [img("1583863788434-e58a36330cf0"), img("1601784551446-20c9e07cdbdb")],
    specifications: { "Length": "2m", "Certification": "MFi", "Power": "Up to 20W" },
  },
  {
    id: "p7", slug: "magsafe-wireless-charger-15w", name: "MagSafe Wireless Charger 15W", brand: "Tekfinity",
    description: "15W magnetic wireless charger with anti-slip base, LED indicator and foreign object detection.",
    price: 4999, compare_at_price: 6999, category_id: "cat-chargers", category_slug: "chargers",
    stock: 45, is_new: true, is_flash_sale: true, colors: ["White", "Black"],
    images: [img("1601784551446-20c9e07cdbdb"), img("1583863788434-e58a36330cf0")],
    specifications: { "Power": "15W", "Stand": "No", "Input": "USB-C PD" },
  },
  {
    id: "p8", slug: "airpods-strap-silicone", name: "AirPods Strap — Silicone Anti-Lost", brand: "Tekfinity",
    description: "Lightweight silicone strap keeps your AirPods secure. Adjustable, sweat-resistant and pocket-friendly.",
    price: 899, compare_at_price: 1299, category_id: "cat-straps", category_slug: "straps",
    stock: 200, is_bestseller: true, colors: ["Teal", "Black", "White", "Pink"],
    images: [img("1615663245857-ac93bb7c39e7"), img("1523275335684-37898b6baf30")],
    specifications: { "Material": "Silicone", "Length": "Adjustable" },
  },
  {
    id: "p9", slug: "iphone-15-pro-max-case-clear", name: "iPhone 15 Pro Max Clear MagSafe Case", brand: "Tekfinity",
    description: "Scratch-resistant clear case with MagSafe ring, military-grade drop protection and anti-yellowing coating.",
    price: 3499, compare_at_price: 4999, category_id: "cat-cases", category_slug: "cases",
    stock: 60, is_featured: true, is_new: true, colors: ["Clear"],
    images: [img("1601784551446-20c9e07cdbdb"), img("1592750475338-74b7b21085ab")],
    specifications: { "Compatibility": "iPhone 15 Pro Max", "MagSafe": "Yes", "Drop Rating": "3m" },
  },
  {
    id: "p10", slug: "iphone-15-case-leather", name: "iPhone 15 Leather Wallet Case", brand: "Tekfinity",
    description: "Genuine leather case with card slots, magnetic closure and raised camera protection.",
    price: 5999, category_id: "cat-cases", category_slug: "cases",
    stock: 8, colors: ["Tan", "Black", "Navy"],
    images: [img("1592750475338-74b7b21085ab"), img("1601784551446-20c9e07cdbdb")],
    specifications: { "Compatibility": "iPhone 15", "Cards": "3 cards", "Material": "PU leather" },
  },
  {
    id: "p11", slug: "power-bank-20000mah-usb-c", name: "Power Bank 20000mAh USB-C PD", brand: "Tekfinity",
    description: "High-capacity power bank with 22.5W PD fast charging, digital display and dual USB output.",
    price: 7999, compare_at_price: 9999, category_id: "cat-power-banks", category_slug: "power-banks",
    stock: 35, is_flash_sale: true, colors: ["Black", "White"],
    images: [img("1609091839311-d5365f9ff1c5"), img("1583863788434-e58a36330cf0")],
    specifications: { "Capacity": "20000mAh", "Output": "22.5W PD", "Ports": "2×USB-A, 1×USB-C" },
  },
  {
    id: "p12", slug: "airpods-ear-tips-set", name: "AirPods Pro Ear Tips (4 Sizes)", brand: "Apple",
    description: "Replacement ear tips in four sizes for optimal fit, comfort and noise isolation.",
    price: 4499, compare_at_price: 5499, category_id: "cat-airpods", category_slug: "airpods",
    stock: 55, colors: ["White"],
    images: [img("1590658268037-6bf12165a8df"), img("1603351154351-5cfb3d04ef30")],
    specifications: { "Sizes": "XS/S/M/L", "Material": "Silicone" },
  },
  {
    id: "p13", slug: "smart-watch-series-8-gps", name: "Smart Watch Series 8 GPS 44mm", brand: "Tekfinity",
    description: "AMOLED display smartwatch with heart-rate, SpO2, sleep tracking, Bluetooth calling and 10-day battery.",
    price: 18999, compare_at_price: 24999, category_id: "cat-smart-watches", category_slug: "smart-watches",
    stock: 18, is_featured: true, is_new: true, colors: ["Black", "Silver"],
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80&auto=format&fit=crop"],
    specifications: { "Display": "1.43\" AMOLED", "Battery": "Up to 10 days", "Sensors": "HR, SpO2, Sleep", "Calling": "Bluetooth" },
  },
  {
    id: "p14", slug: "smart-watch-fitness-band-pro", name: "Smart Watch Fitness Band Pro", brand: "Tekfinity",
    description: "Slim fitness smartwatch with 100+ sport modes, notifications, weather and music control.",
    price: 7999, compare_at_price: 10999, category_id: "cat-smart-watches", category_slug: "smart-watches",
    stock: 32, is_bestseller: true, colors: ["Black", "Teal", "White"],
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop"],
    specifications: { "Display": "1.85\" TFT", "Battery": "Up to 7 days", "Sport Modes": "100+", "Water Resistance": "5ATM" },
  },
  {
    id: "p15", slug: "magsafe-power-bank-10000mah", name: "MagSafe Power Bank 10000mAh", brand: "Tekfinity",
    description: "Compact magnetic power bank with 15W wireless charging, USB-C PD port and LED charge indicator.",
    price: 5499, compare_at_price: 7499, category_id: "cat-power-banks", category_slug: "power-banks",
    stock: 27, is_new: true, colors: ["White", "Black"],
    images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop"],
    specifications: { "Capacity": "10000mAh", "Wireless": "15W MagSafe", "Wired": "22.5W PD" },
  },
];

export const COUPONS: Coupon[] = [
  { id: "c1", code: "WELCOME10", discount_type: "percent", discount_value: 10, min_order_amount: 5000, is_active: true },
  { id: "c2", code: "EID20", discount_type: "percent", discount_value: 20, min_order_amount: 15000, expires_at: "2026-12-31T23:59:59Z", is_active: true },
  { id: "c3", code: "FIRSTORDER", discount_type: "fixed", discount_value: 500, min_order_amount: 3000, usage_limit: 500, used_count: 128, is_active: true },
];

export const FAQS: FAQ[] = [
  { id: "f1", question: "Are these products original?", answer: "We aim to provide authentic products with product verification where supported. Customers can use the product verification system to check registered product codes.", category: "Products", sort_order: 1, is_published: true },
  { id: "f2", question: "How many days does delivery take?", answer: "Within 24 hours in Karachi and approximately 2–3 days in other cities, subject to location and courier availability.", category: "Delivery", sort_order: 2, is_published: true },
  { id: "f3", question: "How can I pay?", answer: "JazzCash, Easypaisa, Bank Transfer, and Cash on Delivery.", category: "Payments", sort_order: 3, is_published: true },
  { id: "f4", question: "What if I don't like the product?", answer: "You can request a return or exchange within seven days, subject to the return policy.", category: "Returns", sort_order: 4, is_published: true },
  { id: "f5", question: "Is there a warranty?", answer: "Six-month checking warranty, subject to the applicable warranty terms.", category: "Warranty", sort_order: 5, is_published: true },
  { id: "f6", question: "How can I track my order?", answer: "Enter your Order ID on the Order Tracking page.", category: "Orders", sort_order: 6, is_published: true },
  { id: "f7", question: "How can I cancel my order?", answer: "You can request cancellation before the order is shipped through the website or WhatsApp.", category: "Orders", sort_order: 7, is_published: true },
  { id: "f8", question: "Do you offer cash on delivery?", answer: "Yes, Cash on Delivery is available across Pakistan. Please keep the exact amount or small change ready for the courier.", category: "Payments", sort_order: 8, is_published: true },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  store_name: "Tekfinity",
  tagline: "Premium Apple accessories & electronics in Pakistan",
  announcement: "Free delivery on orders over Rs. 3,000 — Karachi delivery within 24 hours",
  whatsapp_number: "923001234567",
  contact_email: "support@tekfinity.pk",
  contact_phone: "+92 300 1234567",
  delivery_charge: 250,
  free_delivery_above: 3000,
  return_days: 7,
  warranty_text: "Every eligible product carries a 6-month checking warranty.",
  jazzcash_number: "0300-1234567",
  easypaisa_number: "0301-7654321",
  bank_details: {
    bank_name: "Meezan Bank",
    account_title: "Tekfinity (Pvt) Ltd",
    iban: "PK36MEZN0001234567890123",
    account_number: "0123456789",
  },
  social: { instagram: "https://instagram.com/tekfinity", facebook: "https://facebook.com/tekfinity" },
  seo: {
    title: "Tekfinity — Premium AirPods & Accessories in Pakistan",
    description: "Shop original AirPods, Pro, Max, cases, chargers and premium electronics accessories in Pakistan. Cash on delivery, JazzCash, Easypaisa & bank transfer.",
  },
};
