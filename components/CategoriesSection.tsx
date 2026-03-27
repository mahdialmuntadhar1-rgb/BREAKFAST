import React from 'react';
import { CategoryGrid } from './CategoryGrid';
import type { Category } from '../types';
import { motion } from 'motion/react';

interface CategoriesSectionProps {
    onCategoryClick: (category: Category) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
    onCategoryClick, 
    currentPage, 
    setCurrentPage 
}) => {
    return (
        <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <CategoryGrid 
                onCategoryClick={onCategoryClick} 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </motion.section>
    );
};
