async function getProducts() {
  try {
    const res = await fetch('http://localhost:9000/store/products?limit=10&fields=*categories');
    const data = await res.json();
    console.log(JSON.stringify(data.products[0], null, 2));
  } catch(e) {
    console.error(e);
  }
}
getProducts();
