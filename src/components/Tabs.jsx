export default function Tabs({ selectedTab, setSelectedTab }) {
    const tabs = ["New Designs", "Best Sellers", "Sale"];
  
    return (
<div className="flex gap-4 sm:gap-8 border-b sm:border-b-0 justify-start">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`py-4 text-lg  ${
              selectedTab === tab ? 'font-medium text-black text-sm md:text-lg border-b-2 border-black' : 'font-[300] text-sm md:text-lg text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  }
  