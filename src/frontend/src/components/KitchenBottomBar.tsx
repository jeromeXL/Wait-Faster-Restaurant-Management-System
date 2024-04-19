import { motion } from 'framer-motion';
import { FiClipboard, FiLogOut, FiRefreshCw, FiCoffee } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const KitchenBottomBar = ({
  refreshOrders,
}: {
  refreshOrders: () => void;
}) => {
  const location = useLocation();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center items-center pb-4">
      <motion.nav
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white text-black shadow-lg flex rounded-lg overflow-hidden"
      >
        {location.pathname !== "/notice-board" && (
          <>
            <NavItem
              to="/notice-board?source=kitchen"
              text="Notice Board"
              Icon={FiClipboard}
            />
            <div onClick={refreshOrders} className="flex items-center justify-center gap-2 p-4 hover:bg-gray-100 text-black transition-colors cursor-pointer">
              <FiRefreshCw className="text-lg" />
              <span className="text-base">Refresh</span>
            </div>
          </>
        )}
        {location.pathname === "/notice-board" && (
          <NavItem
            to="/kitchen"
            text="Kitchen"
            Icon={FiCoffee}
          />
        )}
        <NavItem to="/logout" text="Logout" Icon={FiLogOut} />
      </motion.nav>
    </div>
  );
};

const NavItem = ({ to, text, Icon }: any) => {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 p-4 hover:bg-gray-100 text-black transition-colors"
    >
      <Icon className="text-lg" />
      <span className="text-base">{text}</span>
    </Link>
  );
};

export default KitchenBottomBar;