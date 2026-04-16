// components/carousel/TabNavigation.jsx
import { forwardRef } from "react";
import TabButton from "./TabButton";

const TabNavigation = forwardRef(({ tabs, selectedTab, onTabSelect }, ref) => {
  return (
    <div ref={ref} className="opacity-0">
      <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 justify-start lg:justify-end">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            tab={tab}
            isSelected={selectedTab === tab}
            onClick={onTabSelect}
          />
        ))}
      </div>
    </div>
  );
});

TabNavigation.displayName = "TabNavigation";
export default TabNavigation;
