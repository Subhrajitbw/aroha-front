/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "background-default": "#ededed",
        "background-primary": "#343339",
        "border-default": "#cecece",
        "text-inverse": "#fff",
        darkslategray: {
          "100": "rgba(52, 51, 57, 0.2)",
          "200": "rgba(52, 51, 57, 0.5)",
          "300": "rgba(52, 51, 57, 0.8)",
          "400": "rgba(52, 51, 57, 0.4)",
          "500": "rgba(52, 51, 57, 0.3)",
        },
        dimgray: {
          "100": "#59595e",
          "200": "rgba(89, 89, 94, 0.09)",
        },
        gainsboro: {
          "100": "#e6e6e6",
          "200": "rgba(230, 230, 230, 0.09)",
        },
        silver: "#c1bdb5",
      },
      fontFamily: {
        "nav-item": "'Cabinet Grotesk'",
        "heading-large": "NewYork",
        inherit: "inherit",
        "raleway": "'Raleway'",
        "gradmond": "'Gradmond'",
      },
      borderRadius: {
        "sm": "0.125rem", // 2px
        "md": "0.375rem", // 6px
        "lg": "0.5rem", // 8px
        "xl": "0.75rem", // 12px
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
        "full": "9999px", // Full border radius
      },
      spacing: {},
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
      "6xl": "64px",
      "7xl": "75px",
      "8xl": "96px",
      "9xl": "128px",
      "12xl": "144px",
      inherit: "inherit",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      // Custom media queries
      mq1575: { raw: "screen and (max-width: 1575px)" },
      mq1525: { raw: "screen and (max-width: 1525px)" },
      mq1400: { raw: "screen and (max-width: 1400px)" },
      mq1325: { raw: "screen and (max-width: 1325px)" },
      mq1250: { raw: "screen and (max-width: 1250px)" },
      mq1225: { raw: "screen and (max-width: 1225px)" },
      mq1125: { raw: "screen and (max-width: 1125px)" },
      mq1050: { raw: "screen and (max-width: 1050px)" },
      mq975: { raw: "screen and (max-width: 975px)" },
      mq950: { raw: "screen and (max-width: 950px)" },
      mq850: { raw: "screen and (max-width: 850px)" },
      mq825: { raw: "screen and (max-width: 825px)" },
      mq800: { raw: "screen and (max-width: 800px)" },
      mq767: { raw: "screen and (max-width: 767px)" },
      mq750: { raw: "screen and (max-width: 750px)" },
      mq450: { raw: "screen and (max-width: 450px)" },
    },
  },
  
};