// utils/imagePreloader.js
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadHeroImages = async (slides) => {
  const preloadPromises = slides.slice(0, 3).map((slide, index) => {
    const delay = index * 100; // Stagger preloading
    return new Promise(resolve => {
      setTimeout(() => {
        preloadImage(slide.image)
          .then(resolve)
          .catch(resolve); // Don't fail the batch
      }, delay);
    });
  });

  return Promise.all(preloadPromises);
};
