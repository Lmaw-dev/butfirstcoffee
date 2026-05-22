import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton({ label = 'Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <button
      type="button"
      className="back-button"
      onClick={handleBack}
      aria-label="Go back"
    >
      ← {label}
    </button>
  );
}
