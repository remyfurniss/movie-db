import { useState } from "react";

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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal add-watchlist-modal"
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

        <div className="modal-buttons">
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