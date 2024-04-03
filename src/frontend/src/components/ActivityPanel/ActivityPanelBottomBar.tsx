import { motion } from "framer-motion";
import { FiLogOut, FiList, FiCoffee, FiRotateCcw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { UserRole, useAuth } from "../../utils/user";
import { IconType } from "react-icons";

const ActivityPanelBottomBar = ({
    refresh,
}: {
    refresh: () => Promise<void>;
}) => {
    const auth = useAuth();

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center items-center pb-4">
            <motion.nav
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white text-black shadow-lg flex rounded-lg overflow-hidden"
            >
                {auth?.isRole(UserRole.WAIT_STAFF) && (
                    <NavItem to="/orders" text="Orders" Icon={FiCoffee} />
                )}
                {auth?.isRole(UserRole.WAIT_STAFF) && (
                    <NavItem to="/menu" text="Menu" Icon={FiCoffee} />
                )}
                {auth?.isRole(UserRole.MANAGER) && (
                    <NavItem
                        to="/manager/items"
                        text="Edit Food Items"
                        Icon={FiCoffee}
                    />
                )}
                {auth?.isRole(UserRole.MANAGER) && (
                    <NavItem
                        to="/manager/menu"
                        text="Edit Menu"
                        Icon={FiList}
                    />
                )}
                <ButtonItem text="Refresh" Icon={FiRotateCcw} click={refresh} />
                <NavItem to="/logout" text="Logout" Icon={FiLogOut} />
            </motion.nav>
        </div>
    );
};

const NavItem = ({
    to,
    text,
    Icon,
}: {
    to: string;
    text: string;
    Icon: IconType;
}) => {
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

const ButtonItem = ({
    text,
    Icon,
    click,
}: {
    text: string;
    Icon: IconType;
    click: () => Promise<void>;
}) => {
    return (
        <button
            className="flex items-center justify-center gap-2 p-4 hover:bg-gray-100 text-black transition-colors"
            onClick={click}
        >
            <Icon className="text-lg" />
            <span className="text-base">{text}</span>
        </button>
    );
};

export default ActivityPanelBottomBar;
