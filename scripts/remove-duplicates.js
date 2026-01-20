import fs from 'fs';

// Read the Postman collection
const collectionPath = './hr_management_system_complete.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Function to remove duplicates within a section
function removeDuplicatesInSection(section) {
  const seenNames = new Set();
  const uniqueItems = [];
  
  for (const item of section.item) {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueItems.push(item);
    }
  }
  
  const removedCount = section.item.length - uniqueItems.length;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} duplicate(s) from section: ${section.name}`);
  }
  
  section.item = uniqueItems;
  return removedCount;
}

// Process each section to remove duplicates
let totalRemoved = 0;
for (const section of collection.item) {
  if (section.item && Array.isArray(section.item)) {
    totalRemoved += removeDuplicatesInSection(section);
  }
}

// Write the cleaned collection back to the file
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log(`\nTotal duplicates removed: ${totalRemoved}`);
console.log('Postman collection cleaned successfully!');