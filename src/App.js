import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import './App.css';
import Login from "./components/Login";
import AllUsers from "./pages/Users/AllUsers";
import SingleUser from "./pages/Users/SingleUser";
import EditUser from "./pages/Users/EditUser";
import ProductCategory from "./pages/products/ProductCategory";
import CreateProduct from "./pages/products/CreateProduct";
import AllProducts from "./pages/products/AllProducts";
import SingleProduct from "./pages/products/SingleProduct";
import CollectionManager from "./pages/Collections/CollectionManager";
import CollectionProducts from "./pages/Collections/CollectionProducts";
import HomepageCollections from "./pages/Collections/HomePageCollection";
import RecommendedProducts from "./pages/products/RecommendedProducts";
import LoginBanners from "./pages/Banners/LoginBanners";
import HeroBanners from "./pages/Banners/HeroBanner";
import AdBanners from "./pages/Banners/AdBanners";
import LatestProducts from "./pages/products/LatestProducts";
import AdminUserWallet from "./pages/Users/AdminUserWallet";
import AllDesigners from "./pages/Designers/AllDesigners";
import SingleDesigner from "./pages/Designers/SingleDesigner";
import PendingDesigners from "./pages/Designers/PendingDesigners";
import DesignerProducts from "./pages/Designers/DesignerProducts";
import PendingDesignerProducts from "./pages/Designers/PendingDesignerProducts";


const App = () => {
  return (
    <Routes>

      {/* Login Route */}
      <Route path="/" element={<Login />} />

      <Route element={<PrivateRoute />}>
        {/* Dashboard Layout */}
        <Route path="/dashboard" element={<AdminLayout />}>

          <Route index element={<Dashboard />} />

          <Route path="users" element={<AllUsers />} />
          <Route path="users/:id" element={<SingleUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="users/wallet/:id" element={<AdminUserWallet />} />

          <Route path="pending-designers" element={<PendingDesigners />} />
          <Route path="designers" element={<AllDesigners />} />
          <Route path="designer/:id" element={<SingleDesigner />} />
          <Route path="pending-designers-products" element={<PendingDesignerProducts />} />
          <Route path="designers-products" element={<DesignerProducts />} />
          <Route path="designers-products/:designerId" element={<DesignerProducts />} />

          <Route path="productcategory" element={<ProductCategory />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products" element={<AllProducts />} />
          <Route path="products/edit/:id" element={<CreateProduct />} />
          <Route path="products/:id" element={<SingleProduct />} />
          <Route path="products/recommended" element={<RecommendedProducts />} />
          <Route path="products/latest" element={<LatestProducts />} />

          <Route path="collections" element={<CollectionManager />} />
          <Route path="collections/products/:collectionId" element={<CollectionProducts />} />
          <Route path="collections/homepage" element={<HomepageCollections />} />

          <Route path="login-banners" element={<LoginBanners />} />
          <Route path="hero-banners" element={<HeroBanners />} />
          <Route path="ad-banners" element={<AdBanners />} />

        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes >
  );
};

export default App;