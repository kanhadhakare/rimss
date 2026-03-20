require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Lookbook = require('./models/Lookbook');
const bcrypt = require('bcryptjs');
const logger = require('./config/logger');

const products = [
    // ── Sweaters ──────────────────────────────────────────────────────────
    {
        name: 'Heritage Cable-Knit Sweater',
        description: 'A timeless cable-knit sweater crafted from the finest Kashmiri wool, offering warmth and elegance.',
        category: 'sweaters', gender: 'men',
        price: 2800, discountPct: 0,
        colors: ['Cream', 'Navy', 'Forest Green'],
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600'],
        stock: 50, featured: true, rating: 4.8, reviewCount: 124,
    },
    {
        name: 'Merino V-Neck Pullover',
        description: 'Lightweight merino wool pullover — perfect for layering on countryside strolls.',
        category: 'sweaters', gender: 'women',
        price: 2200, discountPct: 15,
        colors: ['Blush', 'Camel', 'Slate'],
        sizes: ['XS', 'S', 'M', 'L'],
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'],
        stock: 60, featured: true, rating: 4.6, reviewCount: 89,
    },
    {
        name: 'Chunky Himalayan Sweater',
        description: 'Authentic traditional pattern in fine Indian wool, hand-finished for a bespoke feel.',
        category: 'sweaters', gender: 'unisex',
        price: 3200, discountPct: 10,
        colors: ['Oatmeal', 'Burgundy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600'],
        stock: 30, featured: false, rating: 4.9, reviewCount: 57,
    },
    // ── Shirts ────────────────────────────────────────────────────────────
    {
        name: 'Classic Tattersall Shirt',
        description: 'The quintessential country shirt with a refined tattersall check — double-cuff, tailored fit.',
        category: 'shirts', gender: 'men',
        price: 1650, discountPct: 0,
        colors: ['Blue/White', 'Green/White', 'Red/Navy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'],
        stock: 80, featured: true, rating: 4.7, reviewCount: 210,
    },
    {
        name: 'Corduroy Casual Shirt',
        description: 'Soft needle corduroy shirt — relaxed cut, ideal for weekends in the country or city.',
        category: 'shirts', gender: 'men',
        price: 1450, discountPct: 20,
        colors: ['Tan', 'Olive', 'Rust'],
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'],
        stock: 45, featured: false, rating: 4.5, reviewCount: 73,
    },
    {
        name: 'Oxford Button-Down Shirt',
        description: 'Crisp Oxford fabric with button-down collar — effortlessly transitions from office to evening.',
        category: 'shirts', gender: 'women',
        price: 1350, discountPct: 0,
        colors: ['White', 'Light Blue', 'Pale Pink'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4fb7?w=600'],
        stock: 70, featured: true, rating: 4.4, reviewCount: 95,
    },
    // ── Shoes ─────────────────────────────────────────────────────────────
    {
        name: 'Country Brogue Oxford',
        description: 'Full grain leather brogues with hand-stitched details — the hallmark of Indian craftsmanship.',
        category: 'shoes', gender: 'men',
        price: 3950, discountPct: 0,
        colors: ['Tan', 'Dark Brown', 'Black'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600'],
        stock: 40, featured: true, rating: 4.9, reviewCount: 188,
    },
    {
        name: 'Chelsea Boot',
        description: 'Sleek Chelsea boot in smooth calfskin — effortlessly elegant, endlessly versatile.',
        category: 'shoes', gender: 'women',
        price: 3450, discountPct: 10,
        colors: ['Black', 'Cognac'],
        sizes: ['3', '4', '5', '6', '7', '8'],
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
        stock: 35, featured: false, rating: 4.7, reviewCount: 102,
    },
    // ── Accessories ───────────────────────────────────────────────────────
    {
        name: 'Kashmiri Handloom Scarf',
        description: 'Pure lambswool scarf in heritage handloom — woven in the Kashmir Valley.',
        category: 'accessories', gender: 'unisex',
        price: 950, discountPct: 0,
        colors: ['Royal Stewart', 'Black Watch', 'Dress Gordon'],
        sizes: ['One Size'],
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'],
        stock: 100, featured: false, rating: 4.6, reviewCount: 44,
    },
    {
        name: 'Leather Belt with Brass Buckle',
        description: 'Full-grain leather belt hand-finished with an antique brass buckle.',
        category: 'accessories', gender: 'men',
        price: 850, discountPct: 0,
        colors: ['Tan', 'Dark Brown'],
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600'],
        stock: 90, featured: false, rating: 4.5, reviewCount: 36,
    },
    // ── Jackets ───────────────────────────────────────────────────────────
    {
        name: 'Moleskin Field Jacket',
        description: 'YCompany signature moleskin jacket — waxed cotton lining, corduroy collar, game pockets.',
        category: 'jackets', gender: 'men',
        price: 4999, discountPct: 5,
        colors: ['Hunter Green', 'Olive', 'Dark Navy'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'],
        stock: 25, featured: true, rating: 5.0, reviewCount: 312,
    },
    {
        name: 'Tweed Blazer',
        description: 'Heritage tweed blazer in a herringbone weave from a Varanasi mill — structured fit.',
        category: 'jackets', gender: 'women',
        price: 4800, discountPct: 0,
        colors: ['Grey Herringbone', 'Brown Herringbone'],
        sizes: ['XS', 'S', 'M', 'L'],
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'],
        stock: 20, featured: true, rating: 4.8, reviewCount: 147,
    },
];

const users = [
    {
        name: 'Admin User',
        email: 'admin@ycompany.com',
        role: 'admin'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user'
    }
];

// Lookbook definitions — product names matched after insert
const lookbookDefs = [
    {
        title: 'The Country Gentleman',
        subtitle: 'Effortless elegance for the modern countryman',
        description: 'A carefully curated ensemble blending heritage tweed, crisp checks, and robust leather accessories. Perfect for autumn walks across the estate or a refined weekend gathering.',
        coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
        season: 'Autumn/Winter 2024',
        tags: ['formal', 'autumn', 'heritage'],
        featured: true,
        productNames: ['Tweed Blazer', 'Classic Tattersall Shirt', 'Country Brogue Oxford', 'Leather Belt with Brass Buckle'],
    },
    {
        title: 'Weekend Retreat',
        subtitle: 'Relaxed layers for countryside escapes',
        description: 'Soft knits, corduroy, and rich earthy tones — this look captures the spirit of unhurried weekends spent between village pubs and rolling hills.',
        coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
        season: 'Autumn/Winter 2024',
        tags: ['casual', 'layering', 'knitwear'],
        featured: true,
        productNames: ['Heritage Cable-Knit Sweater', 'Corduroy Casual Shirt', 'Kashmiri Handloom Scarf', 'Chelsea Boot'],
    },
    {
        title: 'City to Country',
        subtitle: 'Versatile pieces that transition seamlessly',
        description: 'From the morning commute to an evening in the countryside — a wardrobe that moves with you. Clean lines meet heritage fabrics in this cross-context collection.',
        coverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200',
        season: 'Spring/Summer 2025',
        tags: ['versatile', 'transitional', 'smart-casual'],
        featured: false,
        productNames: ['Moleskin Field Jacket', 'Oxford Button-Down Shirt', 'Merino V-Neck Pullover', 'Country Brogue Oxford'],
    },
    {
        title: 'Himalayan Heritage',
        subtitle: 'Celebrating Indian craft and tradition',
        description: 'An ode to the Himalayas — fine patterns, vibrant accents, and robust outerwear crafted from the finest Indian materials.',
        coverImage: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=1200',
        season: 'Autumn/Winter 2024',
        tags: ['indian', 'heritage', 'winter'],
        featured: true,
        productNames: ['Chunky Himalayan Sweater', 'Kashmiri Handloom Scarf', 'Moleskin Field Jacket', 'Leather Belt with Brass Buckle'],
    },
];

const seed = async () => {
    try {
        await connectDB();
        await Product.deleteMany({});
        await User.deleteMany({});
        await Lookbook.deleteMany({});
        logger.info('Cleared existing products, users, and lookbooks');

        const hashedPassword = await bcrypt.hash('12345K', 12);
        const usersWithHashedPasswords = users.map(user => ({
            ...user,
            password: hashedPassword
        }));

        const insertedProducts = await Product.insertMany(products);
        const insertedUsers = await User.insertMany(usersWithHashedPasswords);

        // Build product name → id map
        const productMap = {};
        insertedProducts.forEach(p => { productMap[p.name] = p._id; });

        // Create lookbooks with resolved product IDs
        const lookbooks = lookbookDefs.map(({ productNames, ...rest }) => ({
            ...rest,
            products: productNames.map(name => productMap[name]).filter(Boolean),
        }));
        const insertedLookbooks = await Lookbook.insertMany(lookbooks);

        logger.info(`Seeded ${insertedProducts.length} products successfully`);
        logger.info(`Seeded ${insertedUsers.length} users successfully`);
        logger.info(`Seeded ${insertedLookbooks.length} lookbooks successfully`);
        process.exit(0);
    } catch (err) {
        logger.error(`Seed error: ${err.message}`);
        process.exit(1);
    }
};

seed();
