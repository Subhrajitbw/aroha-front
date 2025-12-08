// components/CategroyNavbar.jsx (Fixed)
import React from "react";
import NavigationButton from "./NavigationButton";
import CategoryTab from "./category/CategoryTab";

const CategoryNavBar = React.forwardRef(({
    categories,
    selectedSlug,
    onTabClick,
    arrowConfig,
    scrollTabs,
    tabsScrollRef
}, tabsRef) => {


    return (
        <div className="flex items-center w-full relative">
            {/* Left Arrow */}
            {arrowConfig.showArrows && (<div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">

                <NavigationButton
                    direction="left"
                    onClick={() => scrollTabs("left")}
                    disabled={arrowConfig.atStart}
                />

            </div>
            )}

            {/* Tabs Container */}
            <div className="flex-1 mx-2 overflow-hidden">
                <div
                    ref={tabsScrollRef}
                    className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <div
                        className="flex gap-3 md:gap-4 py-2 px-2"
                        ref={tabsRef}
                        style={{
                            minWidth: 'max-content',
                            width: 'fit-content'
                        }}
                    >
                        {categories.map((cat, index) => (
                            <CategoryTab
                                key={cat._id || cat.id || `category-${index}`}
                                category={cat}
                                isSelected={selectedSlug === (cat._id || cat.id)}
                                onClick={() => onTabClick(cat._id || cat.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Arrow */}
            {arrowConfig.showArrows && (
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <NavigationButton
                        direction="right"
                        onClick={() => scrollTabs("right")}
                        disabled={arrowConfig.atEnd}
                    />

                </div>
            )}
        </div>
    );
});

CategoryNavBar.displayName = "CategoryNavBar";
export default CategoryNavBar;
