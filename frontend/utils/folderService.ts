import { IFolder } from "@/types/folders";
import { Receipt } from "@/types/receipts";
import { API_BASE_URL, fetchWithAuth } from "./api";

export const folderService = {
  getAllFolders: async (): Promise<IFolder[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/`);
    if (!response) throw new Error("Failed to fetch folders");
    return response.json();
  },

  getFolder: async (id: number): Promise<IFolder> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/${id}/`);
    if (!response) throw new Error("Failed to fetch folder");
    return response.json();
  },

  createFolder: async (name: string, color: string): Promise<IFolder> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, color })
    });
    if (!response) throw new Error("Failed to create folder");
    return response.json();
  },

  updateFolder: async (id: number, name: string, color: string): Promise<IFolder> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, color })
    });
    if (!response) throw new Error("Failed to update folder");
    return response.json();
  },

  deleteFolder: async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/${id}/`, {
      method: "DELETE"
    });
    if (!response) throw new Error("Failed to delete folder");
  },

  addReceiptToFolder: async (folderId: number, receiptId: number): Promise<void> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/folders/${folderId}/receipts/${receiptId}/`,
      {
        method: "PUT"
      }
    );
    if (!response) throw new Error("Failed to add receipt to folder");
  },

  removeReceiptFromFolder: async (folderId: number, receiptId: number): Promise<void> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/folders/${folderId}/receipts/${receiptId}/remove/`,
      {
        method: "PATCH"
      }
    );
    if (!response) throw new Error("Failed to remove receipt from folder");
  },

  getFolderReceipts: async (folderId: number): Promise<number[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/folders/${folderId}/receipts/`);
    if (!response) throw new Error("Failed to fetch folder receipts");
    const data = await response.json();
    return data.map((receipt: Receipt) => receipt.id);
  }
}; 