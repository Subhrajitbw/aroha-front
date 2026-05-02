'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight as ArrowIcon, Calendar as CalendarIcon } from "lucide-react";
import Masonry from "react-masonry-css";
import Breadcrumbs from "../ui/Breadcrumbs";

const JournalClient = ({ initialPosts }) => {
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

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="pt-12 pb-16 px-12">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumbs className="mb-8" />
          <h1 className="font-serif text-8xl text-stone-900 tracking-tight mb-6">Journal</h1>
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-2xl">
            Curated stories celebrating the art of living beautifully, design insights, and timeless inspiration.
          </p>
        </div>
      </section>

      <section className="pb-24 px-12">
        <div className="max-w-[1400px] mx-auto">
          <Masonry breakpointCols={breakpointColumns} className="flex -ml-8 w-auto" columnClassName="pl-8 bg-clip-padding">
            {initialPosts.map((post, index) => (
              <Link key={post._id} href={`/blogs/${post.slug?.current}`} className="group block mb-12">
                <div className={`relative overflow-hidden bg-stone-100 border border-stone-200 mb-6 group-hover:border-stone-400 transition-all ${index % 7 === 0 ? "aspect-[3/4]" : index % 4 === 0 ? "aspect-[4/3]" : "aspect-square"}`}>
                  <img src={post.mainImage?.asset?.url} alt={post.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-3 mb-4 text-stone-400">
                  <CalendarIcon className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-widest">{formatDate(post.publishedAt)}</span>
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-3 group-hover:text-stone-600 transition-colors">{post.title}</h3>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-800">
                  Read Article <ArrowIcon className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </Masonry>
        </div>
      </section>
    </div>
  );
};

export default JournalClient;
