import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilePondUpload from "@/components/receipts/FileUpload";
import '@testing-library/jest-dom';

jest.mock("react-filepond", () => ({
  FilePond: ({ onupdatefiles }: any) => (
    <input
      data-testid="file-input"
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onupdatefiles([{ file }]);
        }
      }}
    />
  ),
  registerPlugin: jest.fn(),
}));

jest.mock("@/utils/api", () => ({
  fetchWithAuth: jest.fn(),
  receiptsUploadApi: "mocked/api/endpoint",
}));

describe("FilePondUpload component", () => {
  const mockSetFile = jest.fn();
  const mockOnOcrDataExtracted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the FilePond component", () => {
    render(
      <FilePondUpload
        setFile={mockSetFile}
        onOcrDataExtracted={mockOnOcrDataExtracted}
      />
    );
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("uploads file and triggers OCR handlers", async () => {
    const dummyFile = new File(["dummy content"], "receipt.png", {
      type: "image/png",
    });

    const mockResponse = {
      ok: true,
      json: async () => ({
        receipt_image_url: "https://example.com/receipt.png",
        merchant: "Test Merchant",
      }),
    };

    const { fetchWithAuth } = require("@/utils/api");
    fetchWithAuth.mockResolvedValue(mockResponse);

    render(
      <FilePondUpload
        setFile={mockSetFile}
        onOcrDataExtracted={mockOnOcrDataExtracted}
      />
    );

    const fileInput = screen.getByTestId("file-input");
    await userEvent.upload(fileInput, dummyFile);

    await waitFor(() => {
      expect(mockSetFile).toHaveBeenCalledWith(dummyFile);
      expect(mockOnOcrDataExtracted).toHaveBeenCalledWith({
        receipt_image_url: "https://example.com/receipt.png",
        merchant: "Test Merchant",
      });
    });
  });
});