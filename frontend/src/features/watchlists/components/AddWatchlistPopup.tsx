import { useState } from "react";

import "./AddWatchlistPopup.css";
import "../../../styles/ui/popup.css"

type AddWatchlistPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateWatchlist: (name: string) => void;
};

export default function AddWatchlistPopup({
  isOpen,
  onClose,
  onCreateWatchlist,
}: AddWatchlistPopupProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateWatchlist(name.trim());
    setName("");
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup add-watchlist-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="rating-popup-title">Enter Watchlist Name</h3>
        
        <input
          className="watchlist-input"
          type="text"
          placeholder="e.g. Movies to Watch 🍿"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />

        <div className="popup-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="confirm-btn"
            disabled={!name.trim()}
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}