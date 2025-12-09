import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowRight } from "lucide-react";
import { sanityClient } from "../lib/sanityClient";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EngagementSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await sanityClient.fetch(
          `*[_type == "post" && featured == true] | order(publishedAt desc)[0...3]{
            _id,
            title,
            slug,
            excerpt,
            mainImage{
              asset->{
                url
              },
              alt
            },
            publishedAt
          }`
        );

        const transformedPosts = posts.map(post => ({
          id: post._id,
          title: post.title,
          description: post.excerpt || 'Read more...',
          image: post.mainImage?.asset?.url || 'https://via.placeholder.com/800',
          slug: post.slug?.current || '',
        }));

        setItems(transformedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // GSAP Animations - Only animate, don't hide initially
  useEffect(() => {
  if (loading || items.length === 0) return;

  const ctx = gsap.context(() => {
    const headerEl = headerRef.current;
    const cardEls = cardsRef.current.filter(Boolean); // remove undefined

    if (headerEl) {
      gsap.set(headerEl, { opacity: 1 });
    }
    if (cardEls.length) {
      gsap.set(cardEls, { opacity: 1 });
    }

    if (!isMobile) {
      if (headerEl) {
        gsap.from(headerEl, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      if (cardEls.length) {
        gsap.from(cardEls, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        });
      }
    }
  }, sectionRef);

  return () => ctx.revert();
}, [loading, items, isMobile]);


  if (loading) {
    return (
      <section className="w-full py-20">
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-t-2 border-stone-900 rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Compact Header */}
        <div ref={headerRef} className="mb-10 md:mb-14 flex items-end justify-between">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
            Journal
          </h2>
          <a 
            href="/blog"
            className="group hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Content */}
        {isMobile ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              bulletClass: 'custom-bullet',
              bulletActiveClass: 'custom-bullet-active',
            }}
            className="pb-10"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <a 
                  href={`/blog/${item.slug}`}
                  className="group block bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-stone-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed text-sm mb-4 line-clamp-2 font-light">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-900">
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {items.map((item, index) => (
              <a 
                key={item.id}
                ref={(el) => (cardsRef.current[index] = el)}
                href={`/blog/${item.slug}`}
                className="group block bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl text-stone-900 mb-2 leading-tight group-hover:text-stone-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-stone-600 leading-relaxed text-sm font-light mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-900 font-medium">
                    Read More
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .custom-bullet {
          width: 8px;
          height: 8px;
          background: #d6d3d1;
          opacity: 1;
          margin: 0 5px;
          transition: all 0.3s ease;
          border-radius: 50%;
          display: inline-block;
        }

        .custom-bullet-active {
          width: 24px;
          background: #1c1917;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
};

export default EngagementSection;
