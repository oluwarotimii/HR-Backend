const d1 = new Date('2024-06-17');
console.log('new Date("2024-06-17") ISO:', d1.toISOString());
console.log('dateStr:', d1.toISOString().split('T')[0]);
console.log('getTime:', d1.getTime());

const d2 = new Date('2024-06-17T00:00:00');
console.log('\nnew Date("2024-06-17T00:00:00") ISO:', d2.toISOString());
console.log('dateStr:', d2.toISOString().split('T')[0]);

const d3 = new Date('2024-06-17T00:00:00+01:00');
console.log('\nnew Date("2024-06-17T00:00:00+01:00") ISO:', d3.toISOString());
console.log('dateStr:', d3.toISOString().split('T')[0]);

// What if the date is constructed from components like new Date(2024, 5, 17)?
const d4 = new Date(2024, 5, 17); // month is 0-indexed, so 5 = June
console.log('\nnew Date(2024, 5, 17) ISO:', d4.toISOString());
console.log('dateStr:', d4.toISOString().split('T')[0]);

// What if someone passes a date string like "17/06/2024"?
const d5 = new Date('17/06/2024');
console.log('\nnew Date("17/06/2024") ISO:', d5.toISOString());
console.log('dateStr:', d5.toISOString().split('T')[0]);
