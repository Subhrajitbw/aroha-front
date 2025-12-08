// pages/BlogPost.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";

const BlogPost = ({ deviceInfo }) => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Changed $slug to $handle in the query
        const data = await sanityClient.fetch(
          `*[_type == "post" && slug.current == $handle][0]{
            _id,
            title,
            slug,
            excerpt,
            body,
            mainImage{
              asset->{
                url
              },
              alt
            },
            publishedAt
          }`,
          { handle } // This now matches the query parameter
        );

        if (!data) {
          navigate("/blogs");
          return;
        }

        setPost(data);

        // Fetch related posts - also changed to $handle
        const related = await sanityClient.fetch(
          `*[_type == "post" && slug.current != $handle] | order(publishedAt desc)[0...3]{
            _id,
            title,
            slug,
            excerpt,
            mainImage{
              asset->{
                url
              }
            },
            publishedAt
          }`,
          { handle } // This now matches the query parameter
        );
        setRelatedPosts(related);
      } catch (error) {
        console.error("Error fetching post:", error);
        navigate("/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [handle, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (body) => {
    if (!body) return 5;
    const text = body
      .map((block) => block.children?.map((child) => child.text).join(" "))
      .join(" ");
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Custom PortableText components
  const portableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className="text-stone-700 leading-[1.9] text-lg font-light mb-8">
          {children}
        </p>
      ),
      h2: ({ children }) => (
        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 tracking-tight mt-16 mb-6">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="font-serif text-2xl md:text-3xl text-stone-900 tracking-tight mt-12 mb-5">
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-stone-300 pl-8 my-10 italic text-stone-600 text-xl font-light">
          {children}
        </blockquote>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-medium text-stone-900">{children}</strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,
      link: ({ value, children }) => (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-900 underline underline-offset-4 hover:text-stone-600 transition-colors"
        >
          {children}
        </a>
      ),
    },
    types: {
      image: ({ value }) => (
        <figure className="my-12">
          <img
            src={value?.asset?.url}
            alt={value?.alt || ""}
            className="w-full border border-stone-200"
          />
          {value?.caption && (
            <figcaption className="text-center text-sm text-stone-500 mt-4 font-light tracking-wide">
              {value.caption}
            </figcaption>
          )}
        </figure>
      ),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Back Button */}
      <div className="fixed top-24 left-8 z-10 hidden lg:block">
        <Link
          to="/blogs"
          className="group flex items-center gap-3 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-light">
            Back to Journal
          </span>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-stone-100 border-b border-stone-200">
        <img
          src={post.mainImage?.asset?.url}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50/80" />
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 md:px-8 -mt-32 relative">
        {/* Header */}
        <header className="bg-white border border-stone-200 p-8 md:p-12 mb-16">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-stone-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-light">
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-light">
                {estimateReadTime(post.body)} min read
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 ml-auto hover:text-stone-900 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-light">
                Share
              </span>
            </button>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-[1.15] mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-stone-600 text-xl font-light leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Decorative line */}
          <div className="h-[1px] w-20 bg-stone-300 mt-8"></div>
        </header>

        {/* Body */}
        <div className="prose-custom mb-20">
          {post.body && (
            <PortableText value={post.body} components={portableTextComponents} />
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-20">
          <div className="h-[1px] flex-1 bg-stone-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
          <div className="h-[1px] flex-1 bg-stone-200"></div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-stone-200 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] w-12 bg-stone-300"></div>
              <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
                Continue Reading
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  to={`/blogs/${relatedPost.slug?.current}`}
                  className="group block"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-stone-100 border border-stone-200 mb-4 group-hover:border-stone-400 transition-all">
                    <img
                      src={relatedPost.mainImage?.asset?.url}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-serif text-xl text-stone-900 leading-tight group-hover:text-stone-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
