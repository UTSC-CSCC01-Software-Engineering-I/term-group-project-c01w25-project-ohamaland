import { Receipt } from "@/types/receipts";
import { Typography } from "@mui/material";

interface IReceiptCardProps {
    receipt: Receipt
}

export default function ReceiptCard(props: IReceiptCardProps) {
    return (
        <Typography>
            {props.receipt.merchant}
        </Typography>
    )
}