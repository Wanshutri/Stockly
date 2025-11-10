import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useState, ReactNode } from "react";
import AddIcon from '@mui/icons-material/Add';

interface BodegaNewItemButtonProps {
  title?: string;
  children: ReactNode; // cualquier contenido que quieras mostrar dentro del modal
}

export default function BodegaNewItemButton({
  title,
  children,
}: BodegaNewItemButtonProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        <AddIcon className="me-3"></AddIcon>
        {title}
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] p-5 md:w-[50%] bg-white shadow-2xl md:p-10">
          {children}
        </div>
      </Modal>
    </div>
  );
}
