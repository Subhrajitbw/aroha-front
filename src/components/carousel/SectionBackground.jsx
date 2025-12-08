// components/carousel/SectionBackground.jsx
export default function SectionBackground() {
  return (
    <>
      <div className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-yellow-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
    </>
  );
}
