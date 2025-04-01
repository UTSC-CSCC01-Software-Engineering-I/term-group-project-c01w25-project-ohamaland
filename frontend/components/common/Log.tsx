import { Box, Divider, Stack, Typography } from "@mui/material";
import { LogData, LogItemProps } from "@/types/logs";

interface LogProps<T extends LogData> {
  title?: string;
  data: T[];
  Component: React.ComponentType<LogItemProps<T>>;
  onOpenDialog?: (item: T) => void;
}

export default function Log<T extends LogData>({
  title,
  data,
  Component,
  onOpenDialog
}: LogProps<T>) {
  return (
    <Box sx={logItemsBoxStyle}>
      {title && (
        <>
          <Typography sx={titleTextStyle}>{title}</Typography>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {data.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No data found.
        </Typography>
      ) : (
        data.map((item, index) => (
          <Stack
            key={`log-item-${index}`}
            sx={itemStyle}
            onClick={() => onOpenDialog?.(item)}
          >
            <Component data={item} />
          </Stack>
        ))
      )}
    </Box>
  );
}

const logItemsBoxStyle = {
  width: '100%',
};

const itemStyle = {
  padding: 1,
  cursor: "pointer",
  transition: "color 0.3s",
  '&:hover': {
    backgroundColor: 'action.hover',
  }
};

const titleTextStyle = {
  fontWeight: 600,
  fontSize: "18px",
  color: "text.primary",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "center",
  width: "100%"
};