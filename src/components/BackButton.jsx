import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton({ label = 'Back', to = null }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
      return;
    }

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
      onMouseDown={(e) => e.preventDefault()}
      aria-label="Go back"
    >
      ← {label}
    </button>
  );
}
