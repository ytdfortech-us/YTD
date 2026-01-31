const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyCY489J3fyWpNeL57kSM6NaXI4yilKpW7s",
  authDomain: "youthedriver.firebaseapp.com",
  projectId: "youthedriver",
  storageBucket: "youthedriver.firebasestorage.app",
  messagingSenderId: "837653476018",
  appId: "1:837653476018:web:cb4ee139019b48ca334fab",
  measurementId: "G-LKD4H2K4NF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample posts data
const samplePosts = [
  {
    author: 'TruckDriver_Mike',
    authorId: 'user_001',
    avatar: '🚛',
    content: 'Found a great truck stop with clean showers in Memphis! Super clean facilities and friendly staff. Highly recommend for overnight parking.',
    likes: 24,
    comments: 8,
    tags: ['truck-stops', 'memphis'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    author: 'HighwayHero_Sarah',
    authorId: 'user_002',
    avatar: '🌟',
    content: 'Just completed my wellness challenge for the week! 🎉 Remember everyone - take those breaks and stay hydrated. Your health is worth more than any deadline.',
    likes: 41,
    comments: 12,
    tags: ['wellness', 'motivation'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    author: 'RoadWarrior_Tom',
    authorId: 'user_003',
    avatar: '⚡',
    content: 'Traffic alert: I-40 near Nashville is backed up for miles due to construction. Taking the detour through route 155. Adding about 30 mins but better than sitting still.',
    likes: 18,
    comments: 5,
    tags: ['traffic', 'nashville', 'alert'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    author: 'FleetCaptain_Lisa',
    authorId: 'user_004',
    avatar: '👑',
    content: 'Advocacy update: Our recent feedback about rest area safety lighting has been heard! Three new locations getting improved lighting this month. Keep speaking up drivers! 💪',
    likes: 67,
    comments: 23,
    tags: ['advocacy', 'safety', 'victory'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    author: 'CargoKing_Dave',
    authorId: 'user_005',
    avatar: '📦',
    content: 'Just finished a coast-to-coast run in record time! From LA to NYC in 3 days. Thanks to everyone who shared traffic updates and rest stop recommendations along the way!',
    likes: 89,
    comments: 34,
    tags: ['achievement', 'long-haul', 'community'],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
  },
  {
    author: 'SafetyFirst_Emma',
    authorId: 'user_006',
    avatar: '🛡️',
    content: 'Quick reminder: Winter weather is coming. Make sure you have your emergency kit ready - blankets, water, non-perishable food, and a first aid kit. Stay safe out there!',
    likes: 156,
    comments: 45,
    tags: ['safety', 'winter', 'preparedness'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    author: 'NightRider_Jake',
    authorId: 'user_007',
    avatar: '🌙',
    content: 'Night driving tips: Keep your windshield clean inside and out, adjust your mirrors to minimize glare, and take breaks every 2 hours. Coffee helps but sleep is better!',
    likes: 92,
    comments: 28,
    tags: ['tips', 'night-driving', 'safety'],
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
  },
  {
    author: 'FuelSaver_Rita',
    authorId: 'user_008',
    avatar: '⛽',
    content: 'Found diesel for $3.29/gallon at the Flying J off I-80 exit 312. Best price I\'ve seen in weeks! Stock up if you\'re passing through.',
    likes: 203,
    comments: 67,
    tags: ['fuel-prices', 'savings', 'i-80'],
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
  }
];

async function seedFirestore() {
  try {
    console.log('🌱 Starting to seed Firestore...\n');

    // Add posts
    console.log('📝 Adding posts...');
    for (const post of samplePosts) {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        updatedAt: post.createdAt
      });
      console.log(`   ✅ Added post by ${post.author} (ID: ${docRef.id})`);
    }

    console.log('\n✨ Firestore seeding completed successfully!');
    console.log(`   Added ${samplePosts.length} posts\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFirestore();
