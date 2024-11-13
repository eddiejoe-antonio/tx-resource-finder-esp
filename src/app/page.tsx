import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AssetInventory from './components/AssetInventory';

const HomePage = () => {
  return (
    <div className='mx-24'>
      <Header />
      <main>
      <AssetInventory />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
