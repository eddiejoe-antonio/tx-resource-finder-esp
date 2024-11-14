import AssetInventory from './components/AssetInventory';
import About from './components/About';

const HomePage = () => {
  return (
    <div className='mx-2 md:mx-36 my-12'>
      <main>
      <AssetInventory />
      </main>
      <About />
    </div>
  );
};

export default HomePage;
