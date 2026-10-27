import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

/* Layouts */
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import { RequireAuth, RequireRole, RequirePerm } from './components/guards'

/* Public pages */
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Tickets from './pages/Tickets'
import MerchandisePage from './pages/Merchandise'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import ScanPayment from './pages/ScanPayment'

/* User account pages */
import AccountHome from './pages/account/AccountHome'
import Profile from './pages/account/Profile'
import Orders from './pages/account/Orders'
import MyTickets from './pages/account/MyTickets'
import Wallet from './pages/account/Wallet'
import Transactions from './pages/account/Transactions'
import MyMerchandise from './pages/account/MyMerchandise'

/* Admin pages */
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminTicketTypes from './pages/admin/TicketTypes'
import AdminOrders from './pages/admin/Orders'
import AdminPayments from './pages/admin/Payments'
import AdminPaymentVerification from './pages/admin/PaymentVerification'
import AdminMerchandise from './pages/admin/Merchandise'
import AdminStores from './pages/admin/Stores'
import AdminAdmins from './pages/admin/Admins'
import AdminPermissions from './pages/admin/Permissions'
import AdminTokenSettings from './pages/admin/TokenSettings'
import AdminCheckin from './pages/admin/Checkin'
import AdminReports from './pages/admin/Reports'
import AdminAuditLogs from './pages/admin/AuditLogs'
import AdminSettings from './pages/admin/Settings'

/* Token Admin pages */
import TokenDashboard from './pages/token/Dashboard'
import TokenTopup from './pages/token/Topup'
import TokenTransactions from './pages/token/Transactions'
import TokenScan from './pages/token/Scan'

/* Store Admin pages */
import StoreDashboard from './pages/store/Dashboard'
import StoreProduct from './pages/store/Product'
import StorePaymentRequests from './pages/store/PaymentRequests'
import StoreScanPayment from './pages/store/ScanPayment'
import StoreTransactions from './pages/store/Transactions'
import StoreReports from './pages/store/Reports'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/merchandise" element={<MerchandisePage />} />
      </Route>

      {/* Authenticated routes */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:paymentId" element={<Payment />} />
        <Route path="/scan-payment" element={<ScanPayment />} />

        {/* User account */}
        <Route path="/account" element={<AccountHome />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/orders" element={<Orders />} />
        <Route path="/account/tickets" element={<MyTickets />} />
        <Route path="/account/wallet" element={<Wallet />} />
        <Route path="/account/transactions" element={<Transactions />} />
        <Route path="/account/merchandise" element={<MyMerchandise />} />

        {/* Super Admin */}
        <Route path="/admin/dashboard" element={<RequireRole roles={['super_admin']}><AdminDashboard /></RequireRole>} />
        <Route path="/admin/users" element={<RequireRole roles={['super_admin']}><AdminUsers /></RequireRole>} />
        <Route path="/admin/tickets" element={<RequireRole roles={['super_admin']}><AdminTicketTypes /></RequireRole>} />
        <Route path="/admin/orders" element={<RequireRole roles={['super_admin']}><AdminOrders /></RequireRole>} />
        <Route path="/admin/payments" element={<RequireRole roles={['super_admin']}><AdminPayments /></RequireRole>} />
        <Route path="/admin/payment-verification" element={<RequireRole roles={['super_admin']}><AdminPaymentVerification /></RequireRole>} />
        <Route path="/admin/merchandise" element={<RequireRole roles={['super_admin']}><AdminMerchandise /></RequireRole>} />
        <Route path="/admin/stores" element={<RequireRole roles={['super_admin']}><AdminStores /></RequireRole>} />
        <Route path="/admin/admins" element={<RequireRole roles={['super_admin']}><AdminAdmins /></RequireRole>} />
        <Route path="/admin/permissions" element={<RequireRole roles={['super_admin']}><AdminPermissions /></RequireRole>} />
        <Route path="/admin/token-settings" element={<RequireRole roles={['super_admin']}><AdminTokenSettings /></RequireRole>} />
        <Route path="/admin/checkin" element={<RequireRole roles={['super_admin']}><AdminCheckin /></RequireRole>} />
        <Route path="/admin/reports" element={<RequireRole roles={['super_admin']}><AdminReports /></RequireRole>} />
        <Route path="/admin/audit-logs" element={<RequireRole roles={['super_admin']}><AdminAuditLogs /></RequireRole>} />
        <Route path="/admin/settings" element={<RequireRole roles={['super_admin']}><AdminSettings /></RequireRole>} />

        {/* Token Admin */}
        <Route path="/token-admin/dashboard" element={<RequireRole roles={['super_admin','token_admin']}><TokenDashboard /></RequireRole>} />
        <Route path="/token-admin/topup" element={<RequireRole roles={['super_admin','token_admin']}><TokenTopup /></RequireRole>} />
        <Route path="/token-admin/transactions" element={<RequireRole roles={['super_admin','token_admin']}><TokenTransactions /></RequireRole>} />
        <Route path="/token-admin/scan" element={<RequireRole roles={['super_admin','token_admin']}><TokenScan /></RequireRole>} />

        {/* Store Admin */}
        <Route path="/store/dashboard" element={<RequireRole roles={['super_admin','store_admin']}><StoreDashboard /></RequireRole>} />
        <Route path="/store/product" element={<RequireRole roles={['super_admin','store_admin']}><StoreProduct /></RequireRole>} />
        <Route path="/store/payment-requests" element={<RequireRole roles={['super_admin','store_admin']}><StorePaymentRequests /></RequireRole>} />
        <Route path="/store/scan-payment" element={<RequireRole roles={['super_admin','store_admin']}><StoreScanPayment /></RequireRole>} />
        <Route path="/store/transactions" element={<RequireRole roles={['super_admin','store_admin']}><StoreTransactions /></RequireRole>} />
        <Route path="/store/reports" element={<RequireRole roles={['super_admin','store_admin']}><StoreReports /></RequireRole>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
