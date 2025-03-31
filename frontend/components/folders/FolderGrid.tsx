import AddIcon from "@mui/icons-material/Add";
import { Box, Grid, IconButton } from "@mui/material";
import { useState } from "react";
import AddFolderDialog from "./AddFolderDialog";
import FolderCard from "./FolderCard";

interface IFolder {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

interface IFolderGridProps {
  folders: IFolder[];
  onAddFolder: (name: string, color: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onFolderClick: (folderId: number) => void;
}

export default function FolderGrid(props: IFolderGridProps) {
  const { folders, onAddFolder, onDeleteFolder, onFolderClick } = props;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddFolder = (name: string, color: string) => {
    onAddFolder(name, color);
    setIsAddDialogOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {folders.map((folder) => (
          <Grid item key={folder.id}>
            <FolderCard
              id={folder.id}
              name={folder.name}
              color={folder.color}
              createdAt={folder.created_at}
              onClick={() => onFolderClick(folder.id)}
              onDeleteFolder={onDeleteFolder}
            />
          </Grid>
        ))}
        <Grid item>
          <Box
            sx={{
              maxWidth: 304,
              margin: "8px",
              borderRadius: "8px",
              height: "64px",
              border: "2px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "#999"
              }
            }}
            onClick={() => setIsAddDialogOpen(true)}
          >
            <IconButton size="large">
              <AddIcon sx={{ fontSize: 40, color: "#666" }} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <AddFolderDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddFolder}
      />
    </Box>
  );
}
