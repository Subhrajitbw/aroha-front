const fetch = require('node-fetch');

async function getCategories() {
  try {
    const res = await fetch('http://localhost:9000/store/product-categories');
    const data = await res.json();
    console.log(data.product_categories.map(c => ({ name: c.name, handle: c.handle })));
  } catch(e) {
    console.error(e);
  }
}
getCategories();
