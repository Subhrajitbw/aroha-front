// pages/JournalsPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Add this import
import { sanityClient } from "../lib/sanityClient";
import { ArrowRight, Calendar } from "lucide-react";
import Masonry from "react-masonry-css";

const JournalsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await sanityClient.fetch(
          `*[_type == "post"] | order(publishedAt desc){
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

        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const breakpointColumns = {
    default: 3,
    1280: 3,
    1024: 2,
    640: 1,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-[1px] w-20 bg-stone-300"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-light">
              Stories & Inspiration
            </span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl text-stone-900 tracking-tight mb-6">
            Journal
          </h1>
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-2xl">
            Curated stories celebrating the art of living beautifully, design
            insights, and timeless inspiration for refined living.
          </p>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="pb-24 px-8 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid-column"
          >
            {posts.map((post, index) => {
              // Create varied layouts
              const isLarge = index % 7 === 0; // Every 7th is tall
              const isMedium = index % 4 === 0 && !isLarge; // Every 4th is landscape
              const isWide = index === 0; // First post is featured-style

              return (
                <Link
                  key={post._id}
                  to={`/blogs/${post.slug?.current}`}
                  className={`group block mb-8 ${
                    isWide ? "md:col-span-2" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden bg-stone-100 border border-stone-200 mb-6 group-hover:border-stone-400 transition-all ${
                      isLarge
                        ? "aspect-[3/4]"
                        : isMedium
                        ? "aspect-[4/3]"
                        : isWide
                        ? "aspect-[16/9]"
                        : "aspect-square"
                    }`}
                  >
                    <img
                      src={post.mainImage?.asset?.url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-95"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3 mb-4 text-stone-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-light">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-serif text-stone-900 mb-3 leading-[1.3] tracking-tight group-hover:text-stone-600 transition-colors ${
                      isWide ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
                    }`}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt - Show on certain cards */}
                  {(isLarge || isMedium || isWide) && post.excerpt && (
                    <p
                      className={`text-stone-500 leading-[1.8] font-light mb-5 line-clamp-3 ${
                        isWide ? "text-base" : "text-sm"
                      }`}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More */}
                  <div className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] text-stone-800 font-light">
                    Read Article
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </Masonry>
        </div>
      </section>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .masonry-grid {
          display: flex;
          margin-left: -32px;
          width: auto;
        }

        .masonry-grid-column {
          padding-left: 32px;
          background-clip: padding-box;
        }

        @media (max-width: 768px) {
          .masonry-grid {
            margin-left: 0;
          }
          .masonry-grid-column {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default JournalsPage;
