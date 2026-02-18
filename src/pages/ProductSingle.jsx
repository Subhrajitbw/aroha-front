import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from "@portabletext/react";
import { ProductInfoCard } from "../components/ProductInfoCard";
import { generateProductSchema } from "../lib/structured-data/productSchema";

const WHATSAPP_NUMBER = "1234567890";

/* ---------------------------- Utility Functions ---------------------------- */

const normalizeImages = (product) => {
  const sorted = [...(product?.images || [])].sort(
    (a, b) => (a?.rank ?? 9999) - (b?.rank ?? 9999)
  );

  const mapped = sorted
    .map((img) => ({ id: img?.id || img?.url, url: img?.url }))
    .filter((img) => img.url);

  if (product?.thumbnail && !mapped.some((img) => img.url === product.thumbnail)) {
    mapped.unshift({
      id: `thumb-${product.id}`,
      url: product.thumbnail,
    });
  }

  return mapped;
};

const cleanText = (text = "") =>
  String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const ProductPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const thumbnailRefs = useRef([]);

  const [product, setProduct] = useState(null);
  const [sanityContent, setSanityContent] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [optionsState, setOptionsState] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [region, setRegion] = useState(null);

  /* ---------------------------- Region Init ---------------------------- */

  useEffect(() => {
    const initRegion = async () => {
      const { regions } = await sdk.store.region.list();
      if (regions?.length) setRegion(regions[0]);
    };
    initRegion();
  }, []);

  /* ---------------------------- Fetch Product ---------------------------- */

  useEffect(() => {
    if (!region) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { products } = await sdk.store.product.list({
          handle,
          region_id: region.id,
          fields:
            "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants,*collection,material,origin_country",
        });

        const productData = products?.[0];
        if (!productData) return navigate("/");

        const normalized = {
          ...productData,
          subtitle: cleanText(productData.subtitle),
          description: productData.description || "",
          images: normalizeImages(productData),
        };

        setProduct(normalized);

        if (normalized.variants?.length) {
          const first = normalized.variants[0];
          const initialOptions = {};
          first.options?.forEach((opt) => {
            initialOptions[opt.option_id] = opt.value;
          });
          setSelectedVariant(first);
          setOptionsState(initialOptions);
        }

        const sanityData = await sanityClient.fetch(
          `*[_type == "product" && handle == $handle][0]`,
          { handle }
        );

        setSanityContent(sanityData);

        /* ---------- Related ---------- */
        if (normalized.collection_id) {
          const { products: related } = await sdk.store.product.list({
            collection_id: [normalized.collection_id],
            region_id: region.id,
            limit: 4,
          });

          setRelatedProducts(
            related
              ?.filter((p) => p.id !== normalized.id)
              .map((item) => ({
                ...item,
                images: normalizeImages(item),
              })) || []
          );
        }
      } catch (err) {
        console.error(err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, region, navigate]);

  /* ---------------------------- Variant Logic ---------------------------- */

  const handleOptionSelect = (optionId, value) => {
    const updated = { ...optionsState, [optionId]: value };
    setOptionsState(updated);

    const match = product?.variants?.find((variant) =>
      variant.options?.every(
        (opt) => updated[opt.option_id] === opt.value
      )
    );

    setSelectedVariant(match || null);
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: (region?.currency_code || "INR").toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const activeVariant = selectedVariant || product?.variants?.[0];

  const price =
    activeVariant?.calculated_price?.calculated_amount ||
    activeVariant?.prices?.[0]?.amount ||
    0;

  const isInStock =
    activeVariant?.manage_inventory === false ||
    activeVariant?.allow_backorder ||
    activeVariant?.inventory_quantity > 0;

  /* ---------------------------- SEO + JSON-LD ---------------------------- */

  useEffect(() => {
    if (!product) return;

    const description =
      sanityContent?.seo?.aiSummary ||
      sanityContent?.shortDescription ||
      product.description;

    document.title = `${product.title} | Aroha House`;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = cleanText(description);

    const schema = generateProductSchema({
      product,
      sanity: sanityContent,
      price,
      inStock: isInStock,
      url: window.location.href,
    });

    const old = document.getElementById("product-schema");
    if (old) old.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "product-schema";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [product, sanityContent, price, isInStock]);

  /* ---------------------------- Render ---------------------------- */

  if (loading || !product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-stone-900 rounded-full animate-spin" />
      </div>
    );

  const images =
    product.images?.length > 0
      ? product.images
      : [{ url: product.thumbnail }];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pt-12">
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* -------- LEFT IMAGES -------- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-[32px] overflow-hidden shadow-xl">
              <img
                src={images[currentImageIndex]?.url}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* -------- RIGHT DETAILS -------- */}
          <div className="lg:col-span-5 space-y-8 sticky top-24">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-amber-700">
                Aroha House Atelier
              </p>
              <h1 className="font-serif text-4xl mt-4">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="mt-3 text-sm text-stone-600 uppercase tracking-wide">
                  {product.subtitle}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <span className="text-3xl font-light">
                  {formatPrice(price)}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isInStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isInStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* -------- Options -------- */}
            {product.options?.map((option) => (
              <div key={option.id}>
                <h4 className="text-xs uppercase tracking-wide mb-3">
                  {option.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((value) => (
                    <button
                      key={value.value}
                      onClick={() =>
                        handleOptionSelect(option.id, value.value)
                      }
                      className={`px-4 py-2 rounded-full border text-sm ${
                        optionsState[option.id] === value.value
                          ? "bg-stone-900 text-white"
                          : "bg-white border-stone-300"
                      }`}
                    >
                      {value.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* -------- WhatsApp -------- */}
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Hi, I'm interested in ${product.title}`
                  )}`
                )
              }
              className="w-full h-12 rounded-full bg-stone-900 text-white uppercase tracking-wide"
            >
              Enquire Now
            </button>
          </div>
        </div>

        {/* -------- RELATED -------- */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="font-serif text-3xl mb-10">
              Designed to Belong Together
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((item) => (
                <ProductInfoCard
                  key={item.id}
                  product={{
                    ...item,
                    image: item.thumbnail,
                    price: formatPrice(
                      item.variants?.[0]?.prices?.[0]?.amount
                    ),
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductPage;
