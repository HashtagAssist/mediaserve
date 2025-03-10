import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Willkommen beim Medienserver</h1>
      <p className="text-xl mb-8">Ihre persönliche Medienbibliothek</p>
    </div>
  );
}
