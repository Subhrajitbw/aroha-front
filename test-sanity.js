import { sanityClient } from './src/lib/sanityClient.js';
async function test() {
  const p = await sanityClient.fetch(`*[_type == "product" && handle == "verona-channel-tufted-barrel-chair-velvet-swivel-taupe"][0]`);
  console.log(JSON.stringify(p.galleryR2, null, 2));
}
test();
