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

          <Route path="productcategory" element={<ProductCategory />} />
          <Route path="products/create" element={<CreateProduct/>}/>
          <Route path="products" element={<AllProducts/>}/>
          <Route path="products/edit/:id" element={<CreateProduct/>}/>
          <Route path="products/:id" element={<SingleProduct/>}/>

        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes >
  );
};

export default App;