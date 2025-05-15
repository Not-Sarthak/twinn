"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Get authentication headers using the user's DID token
 */
const getAuthHeaders = () => {
  const userDID = typeof window !== 'undefined' ? localStorage.getItem("userDID") : null;
  return {
    headers: {
      "Content-Type": "application/json",
      ...(userDID ? { Authorization: `Bearer ${userDID}` } : {}),
    }
  };
};

/**
 * Get all drops with optional filtering
 */
export async function getDrops(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const response = await axios.get(`${API_URL}/drops?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drops:", error);
    // Return a default structure with empty drops array to prevent UI errors
    return {
      drops: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
}

/**
 * Get a drop by ID
 */
export async function getDropById(id: string) {
  try {
    const response = await axios.get(`${API_URL}/drops/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching drop ${id}:`, error);
    // Return a default structure with null drop to prevent UI errors
    return {
      drop: null,
      minted: [],
      moments: []
    };
  }
}

/**
 * Create a new drop
 */
export async function createDrop(dropData: any) {
  try {
    const response = await axios.post(`${API_URL}/drops`, dropData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating drop:", error);
    throw error;
  }
}

/**
 * Update a drop
 */
export async function updateDrop(id: string, dropData: any) {
  try {
    const response = await axios.put(`${API_URL}/drops/${id}`, dropData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error updating drop ${id}:`, error);
    throw error;
  }
}

/**
 * Create a moment for a drop
 */
export async function createMoment(dropId: string, momentData: any) {
  try {
    const response = await axios.post(
      `${API_URL}/drops/${dropId}/moments`, 
      momentData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating moment for drop ${dropId}:`, error);
    throw error;
  }
}

/**
 * Get moments for a drop
 */
export async function getDropMoments(dropId: string, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const response = await axios.get(
      `${API_URL}/drops/${dropId}/moments?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching moments for drop ${dropId}:`, error);
    throw error;
  }
}

/**
 * Delete a moment
 */
export async function deleteMoment(dropId: string, momentId: string) {
  try {
    const response = await axios.delete(
      `${API_URL}/drops/${dropId}/moments/${momentId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting moment ${momentId}:`, error);
    throw error;
  }
}

/**
 * Mint a drop token
 */
export async function mintDrop(dropId: string) {
  try {
    const response = await axios.post(
      `${API_URL}/drops/${dropId}/mint`, 
      {}, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Error minting drop ${dropId}:`, error);
    throw error;
  }
} 