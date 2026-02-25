import './layout.scss';
import Header from '@/components/organisms/Header/index.jsx';
import Footer from '@/components/organisms/Footer/index.jsx';

export default function PrimaryLayout({ children }) {
  return (
    <div className="primary-layout">
      <Header />
      <main className="primary-layout__main">{children}</main>
      <Footer />
    </div>
  );
}
