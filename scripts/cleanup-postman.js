import fs from 'fs';

// Read the Postman collection
const collectionPath = './hr_management_system_complete.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Track seen section names to identify duplicates
const seenSections = new Set();
const uniqueItems = [];

for (const item of collection.item) {
  if (!seenSections.has(item.name)) {
    seenSections.add(item.name);
    uniqueItems.push(item);
  } else {
    console.log(`Duplicate section found and removed: ${item.name}`);
  }
}

// Update the collection with unique items only
const originalLength = collection.item.length;
collection.item = uniqueItems;
const finalLength = collection.item.length;

// Write the cleaned collection back to the file
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log(`\nCleaned Postman collection: Removed duplicate sections.`);
console.log(`Original sections: ${originalLength}`);
console.log(`Final sections: ${finalLength}`);
console.log(`Duplicates removed: ${originalLength - finalLength}`);

// List all sections
console.log('\nRemaining sections:');
collection.item.forEach(item => console.log(`- ${item.name}`));