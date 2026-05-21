import { useEffect } from "react";

const SEO = ({ 
  title, 
  description, 
  image, 
  article = false, 
  breadcrumb = null, 
  schema = null,
  canonicalUrl = null
}) => {
  useEffect(() => {
    // 1. Basic Meta
    document.title = title ? `${title} | Aroha House` : "Aroha House | Premium Furniture & Bespoke Interiors";
    
    const updateMeta = (name, content, attr = "name") => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", description);
    
    // 2. Open Graph / Facebook
    updateMeta("og:title", title, "property");
    updateMeta("og:description", description, "property");
    updateMeta("og:image", image, "property");
    updateMeta("og:type", article ? "article" : "website", "property");
    updateMeta("og:url", window.location.href, "property");

    // 3. Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

    // 4. Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl || window.location.href);

    // 5. Schema.org Injection
    const existingSchema = document.getElementById("structured-data-seo");
    if (existingSchema) existingSchema.remove();

    const scripts = [];

    // Custom Schema (e.g. Product, FAQ)
    if (schema) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "structured-data-seo";
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    }

    // Breadcrumb Schema
    if (breadcrumb) {
      const breadcrumbScript = document.createElement("script");
      breadcrumbScript.type = "application/ld+json";
      breadcrumbScript.id = "breadcrumb-seo";
      breadcrumbScript.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url.startsWith("http") ? item.url : `${window.location.origin}${item.url}`
        }))
      });
      document.head.appendChild(breadcrumbScript);
      scripts.push(breadcrumbScript);
    }

    return () => {
      // Cleanup schemas on unmount
      scripts.forEach(s => s.remove());
      const bSchema = document.getElementById("breadcrumb-seo");
      if (bSchema) bSchema.remove();
    };
  }, [title, description, image, article, schema, breadcrumb, canonicalUrl]);

  return null; // This component doesn't render anything visible
};

export default SEO;
