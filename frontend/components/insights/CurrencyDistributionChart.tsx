import { chart } from "@/styles/colors";
import { Box, LinearProgress } from "@mui/material";
import Image from "next/image"; // Import the Image component from next/image

interface ICurrencyDistributionChartProps {
  currencyDistribution: { currency: string; percentage: number }[];
}

const currencyFlagMapping: Record<string, string> = {
  CAD: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canada.svg/2560px-Flag_of_Canada.svg.png",
  USD: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg",
  EUR: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Flag_of_Europe.svg/1280px-Flag_of_Europe.svg.png",
  GBP: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_the_United_Kingdom.svg"
};

const CurrencyDistributionChart = ({
  currencyDistribution
}: ICurrencyDistributionChartProps) => {
  return (
    <Box sx={containerStyle}>
      <h3>Currency Distribution</h3>
      {currencyDistribution.map(({ currency: currencyCode, percentage }) => {
        const flagUrl = currencyFlagMapping[currencyCode] || "";
        return (
          <Box key={currencyCode} sx={currencyItemStyle}>
            <Box sx={flagContainerStyle}>
              {flagUrl && (
                <Image
                  src={flagUrl}
                  alt={`${currencyCode} flag`}
                  layout="intrinsic"
                  width={40} // Set appropriate width
                  height={40} // Set appropriate height
                  style={flagStyle}
                />
              )}
            </Box>
            <Box sx={currencyInfoStyle}>
              <Box sx={currencyLabelStyle}>
                <span>{currencyCode}</span>
                <span>
                  {percentage !== undefined ? percentage.toFixed(2) : "N/A"}%
                </span>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage || 0}
                sx={progressBarStyle}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default CurrencyDistributionChart;

// Styles
const containerStyle = {
  flex: 1,
  height: "100%",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  borderRadius: "8px",
  fontFamily: "Arial, Helvetica, sans-serif",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start"
};

const currencyItemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "16px"
};

const flagContainerStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  overflow: "hidden",
  marginRight: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const flagStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const currencyInfoStyle = {
  display: "flex",
  flexDirection: "column",
  flex: 1
};

const currencyLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px"
};

const progressBarStyle = {
  height: "8px",
  borderRadius: 5,
  backgroundColor: "#000000",
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
    backgroundColor: chart.line
  }
};
