// Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, images }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <button onClick={onClose} className="mb-2">Close</button>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Uploaded ${index}`} className="max-w-full h-auto" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
