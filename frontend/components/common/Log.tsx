import { defaultText, textLightGrey } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import { Box, Divider, Stack, Typography } from "@mui/material";

interface ILogProps {
    title: string;
    data: any[];
    Component: React.ComponentType<any>;
    onOpenDialog: (subscription: Subscription) => void;
}

export default function Log(props: ILogProps){
    const { title, data, Component } = props;

    return (
        <Box sx={logItemsBoxStyle}>
            <Typography sx={titleTextStyle}>
                {title}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {data.length === 0 ? (
                <Typography>No data found.</Typography>
            ) : (
                data.map((item, index) => (
                    <Stack
                        key={index}
                        sx={itemStyle}
                        onClick={() => props.onOpenDialog(item)}>
                        <Component data={item} />
                    </Stack>
                ))
            )}
        </Box>
    );
}

const logItemsBoxStyle = {

};

const itemStyle = {
    padding: 1,
    cursor: "pointer",
    transition: "color 0.3s",
};

const titleTextStyle = {
    fontWeight: 600,
    fontSize: "18px",
    color: "black",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
    width: "100%",
};