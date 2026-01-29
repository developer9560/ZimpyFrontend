import { Product } from '@/src/types';

export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Amul Taaza Fresh Toned Milk',
        price: 27,
        originalPrice: 30,
        description: 'Amul Taaza is pasteurized toned milk that is fresh, healthy, and delicious. It is rich in calcium and protein, making it perfect for your daily tea, coffee, and breakfast cereals.',
        images: [
            { url: 'https://www.bigbasket.com/media/uploads/p/l/306926_4-amul-homogenised-toned-milk.jpg', alt: 'Amul Taaza Front' },
            { url: 'https://www.bigbasket.com/media/uploads/p/l/306926_5-amul-homogenised-toned-milk.jpg', alt: 'Amul Taaza Back' },
            { url: 'https://www.bigbasket.com/media/uploads/p/l/306926_6-amul-homogenised-toned-milk.jpg', alt: 'Amul Taaza Nutri' },
        ],
        category: 'Dairy & Breakfast',
        slug: 'dairy-breakfast',
        stock: 50,
        unit: '500 ml',
        rating: 4.8,
        reviews: []
    },
    {
        id: '2',
        name: 'Nandini GoodLife Toned Milk',
        price: 28,
        originalPrice: 30,
        description: 'Nandini GoodLife is UHT processed toned milk. It comes in a tetra pack which keeps it fresh for longer without refrigeration until opened.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/240050_4-nandini-goodlife-toned-milk.jpg', alt: 'Nandini GoodLife' }],
        category: 'Dairy & Breakfast',
        slug: 'dairy-breakfast',
        stock: 45,
        unit: '500 ml',
        rating: 4.5,
        reviews: []
    },
    {
        id: '3',
        name: 'Farm Fresh Brown Eggs',
        price: 95,
        originalPrice: 110,
        description: 'Fresh Brown Eggs from free-range hens. These eggs are rich in protein and essential vitamins.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/40033823_2-fresho-farm-eggs-brown-medium-antibiotic-residue-free.jpg', alt: 'Brown Eggs' }],
        category: 'Dairy & Breakfast',
        slug: 'dairy-breakfast',
        stock: 0,
        unit: '6 pcs',
        rating: 4.6,
        reviews: []
    },
    {
        id: '4',
        name: 'Modern Sandwich Bread',
        price: 45,
        originalPrice: 50,
        description: 'Soft and fresh white sandwich bread, perfect for breakfast toast and sandwiches.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/40009472_4-modern-bread-sandwich-supreme.jpg', alt: 'Modern Bread' }],
        category: 'Bakery & Sweets',
        slug: 'bakery-sweets',
        stock: 30,
        unit: '400 g',
        rating: 4.3,
        reviews: []
    },
    {
        id: '5',
        name: 'Amul Salted Butter',
        price: 56,
        originalPrice: 58,
        description: 'Amul Butter is a delicious bread spread, an essential ingredient of baking and a known enhancer for many food items.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/104860_1-amul-butter-pasteurised.jpg', alt: 'Amul Butter' }],
        category: 'Dairy & Breakfast',
        slug: 'dairy-breakfast', // Ensure slug matches keys in CATEGORIES constant
        stock: 100,
        unit: '100 g',
        rating: 4.9,
        reviews: []
    },
    {
        id: '6',
        name: 'Fresh Tomato Local',
        price: 19,
        originalPrice: 40,
        description: 'Fresh local tomatoes.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/10000200_17-fresho-tomato-local.jpg', alt: 'Tomato' }],
        category: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        stock: 100,
        unit: '1 kg',
        rating: 4.9,
        reviews: []
    },
    {
        id: '7',
        name: 'Onion',
        price: 35,
        originalPrice: 60,
        description: 'Fresh Onions.',
        images: [{ url: 'https://www.bigbasket.com/media/uploads/p/l/10000148_30-fresho-onion.jpg', alt: 'Onion' }],
        category: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        stock: 100,
        unit: '1 kg',
        rating: 4.7,
        reviews: []
    }
];
