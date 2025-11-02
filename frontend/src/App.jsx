// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Layout from './components/layout/Layout';
// import Dashboard from './pages/Dashboard';
// import Manageuser from './pages/Manageuser';
// import AddUser from './pages/Adduser';
// import EditUser from './pages/EditUser';
// import Login from './pages/Login';
// import Leads from './pages/Leads';
// import LeadDetails from './pages/LeadDetails';
// import { ToastContainer } from 'react-toastify';
// import ManageCar from './pages/ManageCar';

// import { Car } from 'lucide-react';
// import CarBrands from './pages/CarBrands';
// import CarModel from './pages/CarModel';
// import CarVariant from './pages/CarVariant';
// import CarColor from './pages/CarColor';
// import State from './pages/State';
// import BuyOpportunity from './pages/BuyOpportunityPage';
// import FinanceOpportunityPage from './pages/FinanceOpportunityPage';
// import InsuranceOpportunityPage from './pages/InsuranceOpportunityPage';
// import RtoOpportunityPage from './pages/RtoOpportunityPage';
// import City from './pages/City';
// import SellOpportunityPage from './pages/SellOpportunityPage';
// import DeliveryFormsPage from './pages/DeliveryFormsPage';
// import UserLeads from './pages/UserLeads';


// function App() {
 
//   return (  
    
//     <AuthProvider>
      
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="*" element={
//             <ProtectedRoute>
//               <ToastContainer
//       position="top-right"
//       autoClose={5000}
//       hideProgressBar={false}
//       newestOnTop={false}
//       closeOnClick
//       rtl={false}
//       pauseOnFocusLoss
//       draggable
//       pauseOnHover
//       theme="light"
//     />
//               <Layout>
//                 <Routes>
                  
//                   <Route path="/dashboard" element={<Dashboard />} />
//                   <Route path="/users" element={<Manageuser />} />
//                   <Route path="/users/add" element={<AddUser />} />
//                   <Route path="/users/edit/:id" element={<EditUser />} />
//                   <Route path="/leads" element={isSuperAdmin ? <Leads /> : <UserLeads />} />
//                   <Route path="/leads/:id" element={<LeadDetails />} />
//                   <Route path="/inventory/all" element={<ManageCar />} />
//                   <Route path="/inventory/make" element={<CarBrands />} />
//                   <Route path="/inventory/model" element={<CarModel />} />
//                   <Route path="/inventory/variant" element={<CarVariant />} />
//                   <Route path="/inventory/state" element={<State />} />
//                   <Route path="/inventory/city" element={<City />} />
//                   <Route path="/opportunity/buy" element={<BuyOpportunity />} />
//                   <Route path="/opportunity/finance" element={<FinanceOpportunityPage />} />
//                   <Route path="/opportunity/insurance" element={<InsuranceOpportunityPage />} />
//                   <Route path="/opportunity/rto" element={<RtoOpportunityPage />} />
//                   <Route path="/opportunity/sale" element={<SellOpportunityPage />} />
//                   <Route path="/deliveryforms" element={<DeliveryFormsPage />} />
//                   <Route path="*" element={<Navigate to="/dashboard" replace />} />
//                   {/* <Route path="/opportunity/sale" element={<SaleOpportunity />} />
//                   <Route path="/opportunity/buy" element={<BuyOpportunity />} />
//                   <Route path="/opportunity/finance" element={<FinanceOpportunity />} />
//                   <Route path="/opportunity/insurance" element={<InsuranceOpportunities />} />
//                   <Route path="/opportunity/rto" element={<RTOOpportunities />} /> */}
//                 </Routes>
//               </Layout>
//             </ProtectedRoute>
//           } />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;



// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Manageuser from './pages/Manageuser';
import AddUser from './pages/Adduser';
import EditUser from './pages/EditUser';
import Login from './pages/Login';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import { ToastContainer } from 'react-toastify';
import ManageCar from './pages/ManageCar';
import { Car } from 'lucide-react';
import CarBrands from './pages/CarBrands';
import CarModel from './pages/CarModel';
import CarVariant from './pages/CarVariant';
import CarColor from './pages/CarColor';
import State from './pages/State';
import BuyOpportunity from './pages/BuyOpportunityPage';
import FinanceOpportunityPage from './pages/FinanceOpportunityPage';
import InsuranceOpportunityPage from './pages/InsuranceOpportunityPage';
import RtoOpportunityPage from './pages/RtoOpportunityPage';
import City from './pages/City';
import SellOpportunityPage from './pages/SellOpportunityPage';
import DeliveryFormsPage from './pages/DeliveryFormsPage';
import UserLeads from './pages/UserLeads';
import ManageApi from './pages/ManageApi';
import SalesDashboard from './pages/SalesDashboard';

// Create a separate component for the protected routes
const ProtectedRoutes = () => {
  const { isSuperAdmin } = useAuth(); // This is now inside AuthProvider
  
  return (
    <ProtectedRoute>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Layout>
        <Routes>
          <Route path="/dashboard" element={isSuperAdmin ? <Dashboard /> : <SalesDashboard />} />
          <Route path="/users" element={<Manageuser />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="/leads" element={isSuperAdmin ? <Leads /> : <UserLeads />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/inventory/all" element={<ManageCar />} />
          <Route path="/inventory/make" element={<CarBrands />} />
          <Route path="/inventory/model" element={<CarModel />} />
          <Route path="/inventory/variant" element={<CarVariant />} />
          <Route path="/inventory/state" element={<State />} />
          <Route path="/inventory/city" element={<City />} />
          <Route path="/opportunity/buy" element={<BuyOpportunity />} />
          <Route path="/opportunity/finance" element={<FinanceOpportunityPage />} />
          <Route path="/opportunity/insurance" element={<InsuranceOpportunityPage />} />
          <Route path="/opportunity/rto" element={<RtoOpportunityPage />} />
          <Route path="/opportunity/sale" element={<SellOpportunityPage />} />
          <Route path="/deliveryforms" element={<DeliveryFormsPage />} />
          <Route path="/apis" element={<ManageApi />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (  
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;