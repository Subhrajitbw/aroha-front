// components/AuthModalWrapper.jsx
import Modal from "./Modal";
import AuthPage from "../pages/Auth";
import { useAuthModal } from "../context/AuthModalContext";

const AuthModalWrapper = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useAuthModal();

  return (
    <Modal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)}>
      <AuthPage />
    </Modal>
  );
};

export default AuthModalWrapper;
