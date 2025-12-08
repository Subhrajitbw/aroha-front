import React from 'react';
import { Link } from 'react-router-dom';
import categoriesData from './categories.json'; // Import the JSON file
import './megamenuinverse.css'; // Import the CSS file

const MegamenuInverse = () => {
  // Function to render categories
  const renderCategories = (categories) => {
    return categories.map((category) => (
      <div className="categories-mega-menu-column" key={category.id}>
        <h3 className="category-title">{category.name}</h3>
        <ul className="submenu">
         
          {/* Render subcategories if they exist */}
          {category.children && category.children.length > 0 && (
            category.children.map((subCategory) => (
              <li key={subCategory.id}>
                <Link to={`/${subCategory.slug}`}>{subCategory.name}</Link>
              </li>
            ))
          )}
        </ul>
      </div>
    ));
  };

  return (
    <div className="categories-mega-menu">
      <div className="container-xxlarge">
        <div className="categories-mega-menu-inner">
          {renderCategories(categoriesData)}
        </div>
      </div>
    </div>
  );
};

export default MegamenuInverse;