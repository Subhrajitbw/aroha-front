'use client';

import NavBar from "../layout/NavBar";
import Breadcrumbs from "../ui/Breadcrumbs";

const ContactClient = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-12 pb-24 px-12 max-w-[1400px] mx-auto">
        <Breadcrumbs className="mb-12" />
        <h1 className="font-serif text-8xl mb-24">Contact</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-8 font-bold">Social</h2>
            <div className="space-y-4">
              <a href="#" className="block text-xl hover:text-stone-500 transition-colors">Instagram</a>
              <a href="#" className="block text-xl hover:text-stone-500 transition-colors">Facebook</a>
              <a href="#" className="block text-xl hover:text-stone-500 transition-colors">Twitter</a>
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-8 font-bold">Details</h2>
            <div className="space-y-4">
              <a href="mailto:info@aroha.com" className="block text-xl hover:text-stone-500 transition-colors">info@aroha.com</a>
              <p className="text-xl">+91 98304 83628</p>
            </div>
          </div>

          <div className="md:col-span-1">
            <form className="space-y-8">
              <div className="border-b border-stone-200 py-2">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">Name</label>
                <input type="text" className="w-full bg-transparent outline-none text-lg" placeholder="Your Name" />
              </div>
              <div className="border-b border-stone-200 py-2">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">Email</label>
                <input type="email" className="w-full bg-transparent outline-none text-lg" placeholder="Email Address" />
              </div>
              <div className="border-b border-stone-200 py-2">
                <label className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">Message</label>
                <textarea className="w-full bg-transparent outline-none text-lg min-h-[100px]" placeholder="Your Message" />
              </div>
              <button className="px-12 py-4 bg-stone-900 text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors">
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactClient;
