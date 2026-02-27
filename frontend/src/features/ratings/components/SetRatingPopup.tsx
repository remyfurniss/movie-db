import { useState } from "react";

import "./SetRatingPopup.css";

type SetRatingPopupProps = {
    isOpen: boolean;
    rating: number | null;
    onClose: () => void;
    onRate: (value: number | null) => void;
};

export default function SetRatingPopup({
    isOpen,
    rating,
    onClose,
    onRate
}: SetRatingPopupProps) {

    const [hovered, setHovered] = useState<number | null>(null);

    if (!isOpen) return null;

    return (
        <div
            className="rating-popup-backdrop"
            onClick={onClose}>
            <div
                className="rating-popup"
                onClick={(e) => e.stopPropagation()} // prevent backdrop close
            >
                <h3 className="rating-popup-title">RATE THIS MOVIE</h3>

                <div className="star-container">
                    {[...Array(10)].map((_, index) => {
                        const value = index + 1;

                        return (
                            <button
                                key={value}
                                className={`star ${value <= (hovered ?? rating ?? 0) ? "active" : ""}`}
                                onMouseEnter={() => setHovered(value)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onRate(rating === value ? null : value)}
                                aria-label={`Rate ${value}`}>
                                ★
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}