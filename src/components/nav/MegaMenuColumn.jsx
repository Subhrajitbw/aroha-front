import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Animation variants for each item (column)
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
};

const MegaMenuColumn = ({ title, links, href, hasDivider }) => (
    <motion.div variants={itemVariants} className="flex">
        <div className="flex-grow flex flex-col">

            {/* Title and Links */}
            <div className="flex-grow">
                <h3 className="mb-4 text-xl tracking-wide text-neutral-900 uppercase">{title}</h3>
                <ul className="space-y-1">
                    {links.map((link) => (
                        <li key={link.name || link.title} className="group">
                            <Link
                                to={link.href}
                                className="flex items-center justify-between rounded-md p-2 text-neutral-700 transition-all duration-200 hover:bg-neutral-100/50 hover:text-black hover:pl-3"
                            >
                                <span>{link.name || link.title}</span>
                                <ChevronRight size={16} className="text-neutral-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* "View More" Expanding Button */}
            <div className="mt-auto pt-4 flex justify-center">
                <Link
                    to={href}
                    className="group relative flex items-center justify-center h-10 w-10 hover:w-32 rounded-full bg-neutral-800 text-white transition-all duration-300 ease-in-out overflow-hidden origin-right"
                >
                    {/* Label appears only when expanded - positioned to the left of icon */}
                    <span className="absolute left-3 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
                        View more
                    </span>
                    {/* Icon is always visible and stays on the right */}
                    <ChevronRight
                        size={18}
                        className="absolute right-[0.65rem] text-white transition-transform duration-300 group-hover:translate-x-1"
                    />
                </Link>
            </div>




        </div>
        {hasDivider && <div className="w-px bg-neutral-200/80 ml-8"></div>}
    </motion.div>
);

export default MegaMenuColumn;
