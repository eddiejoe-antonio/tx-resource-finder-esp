import AssetInventory from './components/AssetInventory';
import About from './components/About';
import { Inter } from '@next/font/google';

const inter = Inter({
  subsets: ['latin'], // Adjust subsets as needed.
  variable: '--font-inter', // Optional, for using a CSS variable.
});

const HomePage = () => {
  return (
    <div className={`${inter.variable} mx-4 md:mx-36 my-12`}>
      <main>
        <AssetInventory />
      </main>
      <About />
    </div>
  );
};

export default HomePage;
