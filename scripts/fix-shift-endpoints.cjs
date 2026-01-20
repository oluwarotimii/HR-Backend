const fs = require('fs');
const path = require('path');

// Read the existing Postman collection
const collectionPath = path.join(__dirname, 'hr_management_system_complete_api.postman_collection.json');
let collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Update all shift-related endpoints to use the correct path
function updateShiftEndpoints(items) {
  items.forEach(item => {
    if (item.request && item.request.url && item.name.includes('Shift') || item.name.includes('Time Off') || item.name.includes('Schedule')) {
      // Update URLs to use correct path
      if (item.request.url.raw) {
        item.request.url.raw = item.request.url.raw
          .replace('/api/shift-timings', '/api/shift-scheduling')
          .replace('/api/shift-timing', '/api/shift-scheduling')
          .replace('/api/shifts', '/api/shift-scheduling')
          .replace('/api/schedule', '/api/shift-scheduling')
          .replace('/api/time-off', '/api/shift-scheduling/time-off-banks');
        
        // Update path array as well
        if (item.request.url.path) {
          item.request.url.path = item.request.url.path
            .map(segment => segment
              .replace('shift-timings', 'shift-scheduling')
              .replace('shift-timing', 'shift-scheduling')
              .replace('shifts', 'shift-scheduling')
              .replace('schedule', 'shift-scheduling')
              .replace('time-off-banks', 'shift-scheduling/time-off-banks')
            );
            
          // Special handling for time off banks
          if (item.name.includes('Time Off Bank') && !item.request.url.path.includes('time-off-banks')) {
            if (item.request.url.path.includes('shift-scheduling') && !item.request.url.path.includes('time-off-banks')) {
              // Insert time-off-banks after shift-scheduling if needed
              const shiftSchedIdx = item.request.url.path.indexOf('shift-scheduling');
              if (shiftSchedIdx !== -1 && item.request.url.path[shiftSchedIdx + 1] !== 'time-off-banks') {
                item.request.url.path.splice(shiftSchedIdx + 1, 0, 'time-off-banks');
              }
            }
          }
        }
      }
    }
    
    // Recursively update nested items
    if (item.item && Array.isArray(item.item)) {
      updateShiftEndpoints(item.item);
    }
  });
}

// Update the entire collection
updateShiftEndpoints(collection.item);

// Write the updated collection back
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log('Shift-related endpoints updated to use correct API paths!');
console.log('All shift endpoints now use /api/shift-scheduling as the base path');