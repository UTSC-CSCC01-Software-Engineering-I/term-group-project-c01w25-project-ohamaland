import { textLightGrey } from "@/styles/colors";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Grid, IconButton, Stack, Typography } from "@mui/material";

interface IFolderCardProps {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  onClick: () => void;
  onDeleteFolder: (folderId: number) => void;
}

export default function FolderCard(props: IFolderCardProps) {
  const { id, name, color, createdAt, onClick, onDeleteFolder } = props;
  const formattedDate = createdAt.split("T")[0];

  function getColorStripStyle(color: string) {
    return {
      backgroundColor: color,
      height: "100%",
      width: "16px",
      borderRadius: "8px 0 0 8px"
    };
  }

  return (
    <Grid container spacing={0} sx={cardStyle} onClick={onClick}>
      <Grid xs={1}>
        <Box style={getColorStripStyle(color)} />
      </Grid>
      <Grid xs={11} sx={cardContentStyle}>
        <Stack direction="column" justifyContent="space-between">
          <Box sx={headerBoxStyle}>
            <Typography sx={nameTextStyle}>{name}</Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(id);
              }}
              size="small"
              sx={deleteIconStyle}
            >
              {color !== "#A9A9A9" && <DeleteOutlineIcon />}
            </IconButton>
          </Box>
          <Typography sx={lightTextStyle}>{formattedDate}</Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}

const cardStyle = {
  maxWidth: 304,
  margin: "8px",
  cursor: "pointer",
  borderRadius: "8px",
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)"
};

const cardContentStyle = {
  padding: "8px"
};

const nameTextStyle = {
  fontWeight: 600,
  fontSize: "18px",
  color: "black",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const lightTextStyle = {
  fontSize: "14px",
  color: textLightGrey,
  fontWeight: 700
};

const headerBoxStyle = {
  display: "flex",
  justifyContent: "space-between"
};

const deleteIconStyle = {
  color: textLightGrey,
  padding: 0
};
