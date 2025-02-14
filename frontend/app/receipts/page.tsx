"use client"

import PageWrapper from "@/components/common/layouts/PageWrapper"
import { useState } from "react"
import { tempReceipts } from "./tempReceipts"
import { Category, Receipt } from "@/types/receipts"
import { Dayjs } from "dayjs"
import ReceiptFilter from "@/components/receipts/ReceiptFilter"
import { SelectChangeEvent } from "@mui/material"
import ReceiptGrid from "@/components/receipts/ReceiptGrid"

export default function Page() {
    const [receipts, setReceipts] = useState<Receipt[]>(tempReceipts)
    const [startDate, setStartDate] = useState<Dayjs | null>(null)
    const [endDate, setEndDate] = useState<Dayjs | null>(null)
    const [filterTerm, setFilterTerm] = useState("")
    const [category, setCategory] = useState<Category>("All")

    // TODO: Add call to fetch receipts

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as Category)
    }

    return (
        <PageWrapper>
            <ReceiptFilter
                startDate={startDate}
                endDate={endDate}
                filterTerm={filterTerm}
                category={category}
                setFilterTerm={setFilterTerm}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                handleCategoryChange={handleCategoryChange} 
            />
            <ReceiptGrid
                receipts={receipts}
                startDate={startDate}
                endDate={endDate}
                filterTerm={filterTerm}
                category={category}
            />
        </PageWrapper>
    )
}