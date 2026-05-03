const fs = require('fs');
const content = fs.readFileSync('uml/8-activity-complete-journey.drawio', 'utf8');
const matches = content.match(/<mxCell[^>]*>/g);
matches.forEach(m => {
  if (!m.includes('parent=') && !m.includes('id="0"')) {
    console.log('Missing parent:', m);
  }
});
